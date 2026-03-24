from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class DocumentResponse(BaseModel):
    id: int
    user_id: int
    doc_type: str
    file_url: Optional[str] = None
    status: str
    reviewer_id: Optional[int] = None
    submitted_at: datetime
    reviewed_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class DocumentReview(BaseModel):
    status: str
    comment: Optional[str] = None


class AdminMetrics(BaseModel):
    total_students: int
    active_today: int
    onboarding_completion_rate: float
    survey_completion_rate: float
    savings_users_pct: float
    investment_users_pct: float
    avg_balance: float
    new_this_week: int
