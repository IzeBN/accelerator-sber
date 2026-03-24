from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.account import Account
from app.models.investment import Investment
from app.routers.auth import get_current_user_dep
from app.schemas.investment import InvestmentBuy, InvestmentResponse, InvestmentPortfolio, InvestmentCatalogItem

router = APIRouter(prefix="/investments", tags=["investments"])

CATALOG = [
    InvestmentCatalogItem(
        instrument="Облигации РФ",
        type="bond",
        description="Государственные облигации с фиксированным доходом. Надёжный инструмент с минимальными рисками.",
        min_amount=1000.0,
        expected_return="4–6% годовых",
    ),
    InvestmentCatalogItem(
        instrument="Фонд акций",
        type="stock_fund",
        description="Диверсифицированный фонд акций крупных российских компаний. Умеренный риск.",
        min_amount=500.0,
        expected_return="8–15% годовых",
    ),
    InvestmentCatalogItem(
        instrument="Сберегательный депозит",
        type="deposit",
        description="Банковский вклад с гарантированным доходом. Застрахован АСВ до 1,4 млн руб.",
        min_amount=1000.0,
        expected_return="7–9% годовых",
    ),
]


@router.get("", response_model=InvestmentPortfolio)
async def get_investments(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Investment).where(Investment.user_id == current_user.id).order_by(Investment.opened_at)
    )
    investments = list(result.scalars().all())
    total_value = sum(float(inv.amount) for inv in investments)
    total_profit_pct = (
        sum(float(inv.profit_pct) for inv in investments) / len(investments) if investments else 0.0
    )
    return InvestmentPortfolio(
        investments=[InvestmentResponse.model_validate(inv) for inv in investments],
        total_value=total_value,
        total_profit_pct=round(total_profit_pct, 2),
    )


@router.get("/catalog", response_model=list[InvestmentCatalogItem])
async def get_catalog():
    return CATALOG


@router.post("/buy", response_model=InvestmentResponse, status_code=201)
async def buy_investment(
    body: InvestmentBuy,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    acc_result = await db.execute(select(Account).where(Account.user_id == current_user.id))
    account = acc_result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=400, detail="Счёт не найден")
    if float(account.balance) < body.amount:
        raise HTTPException(status_code=400, detail="Недостаточно средств")

    account.balance = Decimal(str(float(account.balance) - body.amount))
    inv = Investment(
        user_id=current_user.id,
        instrument=body.instrument,
        type=body.type,
        amount=Decimal(str(body.amount)),
        profit_pct=Decimal("0.00"),
    )
    db.add(account)
    db.add(inv)
    await db.commit()
    await db.refresh(inv)
    return InvestmentResponse.model_validate(inv)
