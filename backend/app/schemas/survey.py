from datetime import datetime
from typing import Any
from pydantic import BaseModel


class SurveyAnswerCreate(BaseModel):
    step: int
    question: str
    answer: Any


class SurveyAnswerResponse(BaseModel):
    id: int
    user_id: int
    step: int
    question: str
    answer: Any
    created_at: datetime

    model_config = {"from_attributes": True}
