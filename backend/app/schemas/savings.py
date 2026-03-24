from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


class SavingsGoalCreate(BaseModel):
    title: str
    target_amount: float
    strategy: Optional[str] = None
    deadline: Optional[date] = None


class SavingsGoalUpdate(BaseModel):
    title: Optional[str] = None
    target_amount: Optional[float] = None
    strategy: Optional[str] = None


class SavingsGoalDeposit(BaseModel):
    amount: float


class SavingsGoalResponse(BaseModel):
    id: int
    user_id: int
    title: str
    target_amount: float
    current_amount: float
    strategy: Optional[str] = None
    deadline: Optional[date] = None
    created_at: datetime

    model_config = {"from_attributes": True}
