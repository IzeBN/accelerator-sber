from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel


class UserResponse(BaseModel):
    id: int
    role: str
    full_name: str
    email: str
    phone: Optional[str] = None
    university: Optional[str] = None
    birth_date: Optional[date] = None
    parent_id: Optional[int] = None
    package: str
    onboarding_done: bool
    survey_done: bool
    created_at: datetime

    model_config = {"from_attributes": True}
