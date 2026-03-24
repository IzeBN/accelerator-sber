import time
import uuid
import logging
from typing import Optional

import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/stepan", tags=["stepan"])

# ── Token cache ──────────────────────────────────────────────────────────────
_access_token: Optional[str] = None
_token_expires_at: float = 0.0

GIGACHAT_AUTH_URL = "https://ngw.devices.sberbank.ru:9443/api/v2/oauth"
GIGACHAT_CHAT_URL = "https://gigachat.devices.sberbank.ru/api/v1/chat/completions"

SYSTEM_PROMPT = (
    "Ты — Степан, дружелюбный финансовый помощник студента в приложении СберСтарт. "
    "Отвечай кратко, по-дружески, на русском языке. "
    "Давай конкретные советы по управлению бюджетом, копилкам и инвестициям для студентов."
)

FALLBACK_REPLY = (
    "Привет! Я Степан, твой финансовый помощник. "
    "Сейчас я немного занят, попробуй спросить чуть позже. "
    "Помни: даже 300 ₽ в неделю через год превращаются в 15 600 ₽!"
)


async def _get_access_token() -> str:
    global _access_token, _token_expires_at

    if _access_token and time.time() < _token_expires_at - 60:
        return _access_token

    auth_key = settings.gigachat_auth_key
    if not auth_key:
        raise ValueError("GIGACHAT_AUTH_KEY not configured")

    logger.info("Requesting new GigaChat access token...")
    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(
            GIGACHAT_AUTH_URL,
            headers={
                "Authorization": f"Basic {auth_key}",
                "RqUID": str(uuid.uuid4()),
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json",
            },
            data={"scope": "GIGACHAT_API_PERS"},
            timeout=20,
        )
        logger.info("Auth response status: %s", resp.status_code)
        if resp.status_code != 200:
            logger.error("Auth error body: %s", resp.text)
        resp.raise_for_status()
        data = resp.json()

    _access_token = data["access_token"]
    expires_at = data.get("expires_at", 0)
    # GigaChat returns expires_at in milliseconds
    _token_expires_at = expires_at / 1000 if expires_at > 1_000_000_000_000 else float(expires_at)
    if _token_expires_at < time.time():
        _token_expires_at = time.time() + 1800
    logger.info("Got GigaChat token, expires at %s", _token_expires_at)
    return _access_token


async def _chat_with_gigachat(message: str, history: list[dict] | None = None) -> str:
    token = await _get_access_token()
    logger.info("Sending chat request to GigaChat, history_len=%d", len(history or []))

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if history:
        # Keep last 20 turns to avoid token overflow
        messages += history[-20:]
    # The current message is already the last item in history, so don't add it again
    # (history already contains the current user message)

    async with httpx.AsyncClient(verify=False) as client:
        resp = await client.post(
            GIGACHAT_CHAT_URL,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            json={
                "model": "GigaChat",
                "messages": messages,
                "max_tokens": 300,
                "temperature": 0.7,
            },
            timeout=30,
        )
        logger.info("Chat response status: %s", resp.status_code)
        if resp.status_code != 200:
            logger.error("Chat error body: %s", resp.text)
        resp.raise_for_status()
        data = resp.json()

    return data["choices"][0]["message"]["content"]


# ── Endpoint ─────────────────────────────────────────────────────────────────

class HistoryMessage(BaseModel):
    role: str   # "user" | "assistant"
    content: str

class ChatRequest(BaseModel):
    message: str
    history: list[HistoryMessage] = []


class ChatResponse(BaseModel):
    reply: str


@router.post("/chat", response_model=ChatResponse)
async def stepan_chat(req: ChatRequest) -> ChatResponse:
    if not req.message.strip():
        raise HTTPException(status_code=422, detail="Message cannot be empty")

    if not settings.gigachat_auth_key:
        logger.warning("GIGACHAT_AUTH_KEY is not set, returning fallback")
        return ChatResponse(reply=FALLBACK_REPLY)

    logger.info("gigachat_auth_key present: %s chars", len(settings.gigachat_auth_key))

    history = [{"role": m.role, "content": m.content} for m in req.history]

    try:
        reply = await _chat_with_gigachat(req.message, history)
        return ChatResponse(reply=reply)
    except httpx.HTTPStatusError as exc:
        logger.error("GigaChat HTTP error %s: %s", exc.response.status_code, exc.response.text)
        if exc.response.status_code == 401:
            global _access_token, _token_expires_at
            _access_token = None
            _token_expires_at = 0.0
            try:
                reply = await _chat_with_gigachat(req.message, history)
                return ChatResponse(reply=reply)
            except Exception as retry_exc:
                logger.error("GigaChat retry failed: %s", retry_exc)
        return ChatResponse(reply=FALLBACK_REPLY)
    except httpx.ConnectError as exc:
        logger.error("GigaChat connection error: %s", exc)
        return ChatResponse(reply=FALLBACK_REPLY)
    except httpx.TimeoutException as exc:
        logger.error("GigaChat timeout: %s", exc)
        return ChatResponse(reply="Степан думает слишком долго — попробуй ещё раз!")
    except Exception as exc:
        logger.error("GigaChat unexpected error: %s", type(exc).__name__, exc_info=True)
        return ChatResponse(reply=FALLBACK_REPLY)


@router.get("/debug")
async def stepan_debug():
    """Diagnostic endpoint — shows config and tests GigaChat auth."""
    key = settings.gigachat_auth_key
    result = {
        "key_configured": bool(key),
        "key_length": len(key) if key else 0,
        "token_cached": bool(_access_token),
        "token_expires_in": max(0, _token_expires_at - time.time()) if _token_expires_at else 0,
    }
    if key:
        try:
            token = await _get_access_token()
            result["auth_ok"] = True
            result["token_preview"] = token[:20] + "..."
        except Exception as exc:
            result["auth_ok"] = False
            result["auth_error"] = str(exc)
    return result
