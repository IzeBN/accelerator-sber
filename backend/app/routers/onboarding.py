from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import User
from app.models.document import Document
from app.routers.auth import get_current_user_dep
from app.schemas.user import UserResponse
from app.schemas.admin import DocumentResponse

router = APIRouter(prefix="/onboarding", tags=["onboarding"])


class PackageUpdate(BaseModel):
    package: str


class VerifyStudentRequest(BaseModel):
    doc_type: str
    file_url: str | None = None


@router.put("/package", response_model=UserResponse)
async def set_package(
    body: PackageUpdate,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    if body.package not in ("base", "standard", "premium"):
        raise HTTPException(status_code=400, detail="Invalid package")
    current_user.package = body.package
    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


@router.post("/verify-student", response_model=DocumentResponse)
async def verify_student(
    body: VerifyStudentRequest,
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    doc = Document(
        user_id=current_user.id,
        doc_type=body.doc_type,
        file_url=body.file_url,
        status="pending",
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)
    return DocumentResponse.model_validate(doc)


@router.put("/complete")
async def complete_onboarding(
    current_user: Annotated[User, Depends(get_current_user_dep)],
    db: AsyncSession = Depends(get_db),
):
    current_user.onboarding_done = True
    db.add(current_user)
    await db.commit()
    return {"ok": True}
