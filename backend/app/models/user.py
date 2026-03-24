from datetime import datetime, date
from typing import Optional
from sqlalchemy import String, Boolean, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    role: Mapped[str] = mapped_column(String(20), nullable=False, default="student")
    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(200), nullable=False, unique=True, index=True)
    phone: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    university: Mapped[Optional[str]] = mapped_column(String(300), nullable=True)
    birth_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    parent_id: Mapped[Optional[int]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    package: Mapped[str] = mapped_column(String(20), nullable=False, default="base")
    onboarding_done: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    survey_done: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    account: Mapped[Optional["Account"]] = relationship("Account", back_populates="user", uselist=False)
    savings_goals: Mapped[list["SavingsGoal"]] = relationship("SavingsGoal", back_populates="user")
    investments: Mapped[list["Investment"]] = relationship("Investment", back_populates="user")
    survey_answers: Mapped[list["SurveyAnswer"]] = relationship("SurveyAnswer", back_populates="user")
    documents: Mapped[list["Document"]] = relationship(
        "Document", back_populates="user", foreign_keys="Document.user_id"
    )
    children: Mapped[list["User"]] = relationship(
        "User", foreign_keys=[parent_id], back_populates="parent"
    )
    parent: Mapped[Optional["User"]] = relationship(
        "User", foreign_keys=[parent_id], back_populates="children", remote_side="User.id"
    )
