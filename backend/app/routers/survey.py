from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.survey import SurveyAnswer
from app.routers.auth import get_current_user_dep
from app.schemas.survey import SurveyAnswerCreate, SurveyAnswerResponse

router = APIRouter(prefix="/survey", tags=["survey"])


@router.post("/answer")
async def save_answer(
    body: SurveyAnswerCreate,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    answer = SurveyAnswer(
        user_id=current_user.id,
        step=body.step,
        question=body.question,
        answer=body.answer,
    )
    db.add(answer)
    await db.commit()
    return {"ok": True}


@router.get("/answers", response_model=list[SurveyAnswerResponse])
async def get_answers(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(SurveyAnswer)
        .where(SurveyAnswer.user_id == current_user.id)
        .order_by(SurveyAnswer.step)
    )
    return [SurveyAnswerResponse.model_validate(a) for a in result.scalars().all()]


@router.put("/complete")
async def complete_survey(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    current_user.survey_done = True
    db.add(current_user)
    await db.commit()
    return {"ok": True}
