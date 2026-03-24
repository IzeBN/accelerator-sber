from datetime import datetime, timedelta
from decimal import Decimal
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.stepan import StepanTip
from app.routers.auth import get_current_user_dep
from app.schemas.transaction import TransactionResponse
from app.services.analytics import get_spending_chart

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
async def get_summary(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    acc_result = await db.execute(select(Account).where(Account.user_id == current_user.id))
    account = acc_result.scalar_one_or_none()
    balance = float(account.balance) if account else 0.0

    now = datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    income_month = 0.0
    expense_month = 0.0
    top_categories: list[dict] = []

    if account:
        income_result = await db.execute(
            select(func.sum(Transaction.amount)).where(
                Transaction.account_id == account.id,
                Transaction.amount > 0,
                Transaction.tx_date >= month_start,
            )
        )
        income_month = float(income_result.scalar() or 0)

        expense_result = await db.execute(
            select(func.sum(Transaction.amount)).where(
                Transaction.account_id == account.id,
                Transaction.amount < 0,
                Transaction.tx_date >= month_start,
            )
        )
        expense_month = float(abs(expense_result.scalar() or 0))

        cat_result = await db.execute(
            select(Transaction.category, func.sum(Transaction.amount).label("total"))
            .where(
                Transaction.account_id == account.id,
                Transaction.amount < 0,
                Transaction.tx_date >= month_start,
            )
            .group_by(Transaction.category)
            .order_by(func.sum(Transaction.amount))
            .limit(5)
        )
        rows = cat_result.all()
        total_expense = expense_month or 1
        top_categories = [
            {
                "category": row.category,
                "amount": float(abs(row.total)),
                "pct": round(float(abs(row.total)) / total_expense * 100, 1),
            }
            for row in rows
        ]

    last_income_result = await db.execute(
        select(Transaction.tx_date)
        .join(Account, Transaction.account_id == Account.id)
        .where(Account.user_id == current_user.id, Transaction.category == "income")
        .order_by(Transaction.tx_date.desc())
        .limit(1)
    )
    last_income = last_income_result.scalar_one_or_none()
    if last_income:
        next_income = last_income + timedelta(days=30)
        days_until_next_income = max(0, (next_income.date() - now.date()).days)
    else:
        days_until_next_income = 15

    daily_limit = round(balance / max(days_until_next_income, 1), 2) if days_until_next_income > 0 else balance

    return {
        "balance": balance,
        "income_month": income_month,
        "expense_month": expense_month,
        "cashback_balance": round(expense_month * 0.05, 2),
        "bonus_points": int(expense_month * 2),
        "top_categories": top_categories,
        "days_until_next_income": days_until_next_income,
        "daily_limit": daily_limit,
    }


@router.get("/transactions", response_model=list[TransactionResponse])
async def get_transactions(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    acc_result = await db.execute(select(Account).where(Account.user_id == current_user.id))
    account = acc_result.scalar_one_or_none()
    if not account:
        return []

    result = await db.execute(
        select(Transaction)
        .where(Transaction.account_id == account.id)
        .order_by(Transaction.tx_date.desc())
        .limit(limit)
        .offset(offset)
    )
    return [TransactionResponse.model_validate(t) for t in result.scalars().all()]


@router.get("/tips")
async def get_tips(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StepanTip).order_by(StepanTip.priority.desc()).limit(5)
    )
    tips = result.scalars().all()
    return [{"id": t.id, "trigger": t.trigger, "text": t.text} for t in tips]


@router.get("/spending-chart")
async def spending_chart(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    acc_result = await db.execute(select(Account).where(Account.user_id == current_user.id))
    account = acc_result.scalar_one_or_none()
    if not account:
        return []
    return await get_spending_chart(db, account.id)
