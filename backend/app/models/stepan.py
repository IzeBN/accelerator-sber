from sqlalchemy import String, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class StepanTip(Base):
    __tablename__ = "stepan_tips"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    trigger: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
