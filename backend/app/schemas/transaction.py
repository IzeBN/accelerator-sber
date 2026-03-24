from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class TransactionResponse(BaseModel):
    id: int
    account_id: int
    amount: float
    category: str
    description: Optional[str] = None
    tx_date: datetime

    model_config = {"from_attributes": True}
