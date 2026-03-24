from datetime import datetime, timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.account import Account
from app.models.document import Document
from app.models.savings import SavingsGoal
from app.models.investment import Investment
from app.models.transaction import Transaction
from app.routers.auth import get_current_user_dep
from app.schemas.admin import DocumentResponse, DocumentReview, AdminMetrics

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: User) -> User:
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return current_user


@router.get("/documents", response_model=list[DocumentResponse])
async def get_documents(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
    status: str | None = Query(None),
):
    require_admin(current_user)
    q = select(Document)
    if status:
        q = q.where(Document.status == status)
    q = q.order_by(Document.submitted_at.desc())
    result = await db.execute(q)
    return [DocumentResponse.model_validate(d) for d in result.scalars().all()]


@router.put("/documents/{doc_id}/review", response_model=DocumentResponse)
async def review_document(
    doc_id: int,
    body: DocumentReview,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)
    if body.status not in ("approved", "rejected"):
        raise HTTPException(status_code=400, detail="Статус должен быть approved или rejected")

    result = await db.execute(select(Document).where(Document.id == doc_id))
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(status_code=404, detail="Документ не найден")

    doc.status = body.status
    doc.reviewer_id = current_user.id
    doc.reviewed_at = datetime.utcnow()
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return DocumentResponse.model_validate(doc)


@router.get("/metrics", response_model=AdminMetrics)
async def get_metrics(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    require_admin(current_user)

    total_students = (await db.execute(
        select(func.count(User.id)).where(User.role == "student")
    )).scalar() or 0

    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    active_today = (await db.execute(
        select(func.count(func.distinct(User.id)))
        .join(Account, Account.user_id == User.id)
        .join(Transaction, Transaction.account_id == Account.id)
        .where(User.role == "student", Transaction.tx_date >= today_start)
    )).scalar() or 0

    onboarding_done = (await db.execute(
        select(func.count(User.id)).where(User.role == "student", User.onboarding_done.is_(True))
    )).scalar() or 0
    onboarding_rate = round(onboarding_done / total_students * 100, 1) if total_students else 0.0

    survey_done = (await db.execute(
        select(func.count(User.id)).where(User.role == "student", User.survey_done.is_(True))
    )).scalar() or 0
    survey_rate = round(survey_done / total_students * 100, 1) if total_students else 0.0

    savings_users = (await db.execute(
        select(func.count(func.distinct(SavingsGoal.user_id)))
    )).scalar() or 0
    savings_pct = round(savings_users / total_students * 100, 1) if total_students else 0.0

    invest_users = (await db.execute(
        select(func.count(func.distinct(Investment.user_id)))
    )).scalar() or 0
    invest_pct = round(invest_users / total_students * 100, 1) if total_students else 0.0

    avg_balance = float((await db.execute(
        select(func.avg(Account.balance))
        .join(User, User.id == Account.user_id)
        .where(User.role == "student")
    )).scalar() or 0)

    week_ago = datetime.utcnow() - timedelta(days=7)
    new_this_week = (await db.execute(
        select(func.count(User.id)).where(User.role == "student", User.created_at >= week_ago)
    )).scalar() or 0

    return AdminMetrics(
        total_students=total_students,
        active_today=active_today,
        onboarding_completion_rate=onboarding_rate,
        survey_completion_rate=survey_rate,
        savings_users_pct=savings_pct,
        investment_users_pct=invest_pct,
        avg_balance=round(avg_balance, 2),
        new_this_week=new_this_week,
    )
