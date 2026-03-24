from typing import Optional
from pydantic import BaseModel


class BenefitResponse(BaseModel):
    id: int
    title: str
    description: str
    category: str
    eligible_package: str
    link: Optional[str] = None

    model_config = {"from_attributes": True}
