from datetime import datetime
from pydantic import BaseModel


class InvestmentBuy(BaseModel):
    instrument: str
    type: str
    amount: float


class InvestmentResponse(BaseModel):
    id: int
    user_id: int
    instrument: str
    type: str
    amount: float
    profit_pct: float
    opened_at: datetime

    model_config = {"from_attributes": True}


class InvestmentPortfolio(BaseModel):
    investments: list[InvestmentResponse]
    total_value: float
    total_profit_pct: float


class InvestmentCatalogItem(BaseModel):
    instrument: str
    type: str
    description: str
    min_amount: float
    expected_return: str
