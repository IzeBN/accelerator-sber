from datetime import datetime, timedelta
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.routers.auth import get_current_user_dep
from app.schemas.user import UserResponse
from app.schemas.transaction import TransactionResponse

router = APIRouter(prefix="/parent", tags=["parent"])


class TransferRequest(BaseModel):
    amount: float
    comment: str | None = None


@router.get("/children", response_model=list[UserResponse])
async def get_children(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "parent":
        raise HTTPException(status_code=403, detail="Только для родителей")
    result = await db.execute(select(User).where(User.parent_id == current_user.id))
    return [UserResponse.model_validate(u) for u in result.scalars().all()]


@router.get("/child/{child_id}/summary")
async def get_child_summary(
    child_id: int,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "parent":
        raise HTTPException(status_code=403, detail="Только для родителей")
    child_result = await db.execute(
        select(User).where(User.id == child_id, User.parent_id == current_user.id)
    )
    child = child_result.scalar_one_or_none()
    if not child:
        raise HTTPException(status_code=404, detail="Студент не найден")

    acc_result = await db.execute(select(Account).where(Account.user_id == child_id))
    account = acc_result.scalar_one_or_none()
    balance = float(account.balance) if account else 0.0

    now = datetime.utcnow()
    week_start = now - timedelta(days=7)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    expense_week = 0.0
    expense_month = 0.0
    if account:
        week_result = await db.execute(
            select(func.sum(Transaction.amount)).where(
                Transaction.account_id == account.id,
                Transaction.amount < 0,
                Transaction.tx_date >= week_start,
            )
        )
        expense_week = float(abs(week_result.scalar() or 0))

        month_result = await db.execute(
            select(func.sum(Transaction.amount)).where(
                Transaction.account_id == account.id,
                Transaction.amount < 0,
                Transaction.tx_date >= month_start,
            )
        )
        expense_month = float(abs(month_result.scalar() or 0))

    return {"balance": balance, "expense_week": expense_week, "expense_month": expense_month}


@router.post("/child/{child_id}/transfer", response_model=TransactionResponse)
async def transfer_to_child(
    child_id: int,
    body: TransferRequest,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    if current_user.role != "parent":
        raise HTTPException(status_code=403, detail="Только для родителей")
    if body.amount <= 0:
        raise HTTPException(status_code=400, detail="Сумма должна быть положительной")

    child_result = await db.execute(
        select(User).where(User.id == child_id, User.parent_id == current_user.id)
    )
    child = child_result.scalar_one_or_none()
    if not child:
        raise HTTPException(status_code=404, detail="Студент не найден")

    acc_result = await db.execute(select(Account).where(Account.user_id == child_id))
    account = acc_result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=400, detail="Счёт студента не найден")

    account.balance = Decimal(str(float(account.balance) + body.amount))
    tx = Transaction(
        account_id=account.id,
        amount=Decimal(str(body.amount)),
        category="transfer",
        description=body.comment or "Перевод от родителя",
    )
    db.add(account)
    db.add(tx)
    await db.commit()
    await db.refresh(tx)
    return TransactionResponse.model_validate(tx)
