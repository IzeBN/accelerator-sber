from decimal import Decimal
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.account import Account
from app.models.savings import SavingsGoal
from app.routers.auth import get_current_user_dep
from app.schemas.savings import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalDeposit, SavingsGoalResponse

router = APIRouter(prefix="/savings", tags=["savings"])


async def _get_goal_or_404(goal_id: int, user_id: int, db: AsyncSession) -> SavingsGoal:
    result = await db.execute(
        select(SavingsGoal).where(SavingsGoal.id == goal_id, SavingsGoal.user_id == user_id)
    )
    goal = result.scalar_one_or_none()
    if not goal:
        raise HTTPException(status_code=404, detail="Цель не найдена")
    return goal


@router.get("/goals", response_model=list[SavingsGoalResponse])
async def get_goals(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SavingsGoal).where(SavingsGoal.user_id == current_user.id).order_by(SavingsGoal.created_at)
    )
    return [SavingsGoalResponse.model_validate(g) for g in result.scalars().all()]


@router.post("/goals", response_model=SavingsGoalResponse, status_code=201)
async def create_goal(
    body: SavingsGoalCreate,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    goal = SavingsGoal(
        user_id=current_user.id,
        title=body.title,
        target_amount=body.target_amount,
        strategy=body.strategy,
        deadline=body.deadline,
    )
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return SavingsGoalResponse.model_validate(goal)


@router.put("/goals/{goal_id}", response_model=SavingsGoalResponse)
async def update_goal(
    goal_id: int,
    body: SavingsGoalUpdate,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    goal = await _get_goal_or_404(goal_id, current_user.id, db)
    if body.title is not None:
        goal.title = body.title
    if body.target_amount is not None:
        goal.target_amount = body.target_amount
    if body.strategy is not None:
        goal.strategy = body.strategy
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return SavingsGoalResponse.model_validate(goal)


@router.post("/goals/{goal_id}/deposit", response_model=SavingsGoalResponse)
async def deposit_to_goal(
    goal_id: int,
    body: SavingsGoalDeposit,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    goal = await _get_goal_or_404(goal_id, current_user.id, db)
    acc_result = await db.execute(select(Account).where(Account.user_id == current_user.id))
    account = acc_result.scalar_one_or_none()
    if not account:
        raise HTTPException(status_code=400, detail="Счёт не найден")
    if float(account.balance) < body.amount:
        raise HTTPException(status_code=400, detail="Недостаточно средств")

    account.balance = Decimal(str(float(account.balance) - body.amount))
    goal.current_amount = Decimal(str(float(goal.current_amount) + body.amount))
    db.add(account)
    db.add(goal)
    await db.commit()
    await db.refresh(goal)
    return SavingsGoalResponse.model_validate(goal)


@router.delete("/goals/{goal_id}", status_code=204)
async def delete_goal(
    goal_id: int,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    goal = await _get_goal_or_404(goal_id, current_user.id, db)
    await db.delete(goal)
    await db.commit()
