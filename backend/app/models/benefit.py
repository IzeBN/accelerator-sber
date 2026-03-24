from typing import Optional
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Benefit(Base):
    __tablename__ = "benefits"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False)
    eligible_package: Mapped[str] = mapped_column(String(20), nullable=False, default="base")
    link: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
