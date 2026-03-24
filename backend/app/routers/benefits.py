from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.benefit import Benefit
from app.routers.auth import get_current_user_dep
from app.schemas.benefit import BenefitResponse

router = APIRouter(prefix="/benefits", tags=["benefits"])

PACKAGE_LEVELS = {"base": 0, "standard": 1, "premium": 2}


@router.get("", response_model=list[BenefitResponse])
async def get_benefits(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    user_level = PACKAGE_LEVELS.get(current_user.package, 0)
    eligible_packages = [pkg for pkg, lvl in PACKAGE_LEVELS.items() if lvl <= user_level]
    result = await db.execute(
        select(Benefit).where(Benefit.eligible_package.in_(eligible_packages)).order_by(Benefit.id)
    )
    return [BenefitResponse.model_validate(b) for b in result.scalars().all()]
