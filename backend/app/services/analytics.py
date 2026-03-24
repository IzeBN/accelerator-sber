from datetime import datetime, timedelta
from decimal import Decimal
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.transaction import Transaction


async def get_spending_chart(session: AsyncSession, account_id: int) -> list[dict]:
    now = datetime.utcnow()
    result = []

    for i in range(3, -1, -1):
        month_start = (now.replace(day=1) - timedelta(days=i * 28)).replace(day=1)
        if month_start.month == 12:
            month_end = month_start.replace(year=month_start.year + 1, month=1)
        else:
            month_end = month_start.replace(month=month_start.month + 1)

        categories = ["food", "transport", "cafe", "education", "entertainment"]
        row: dict = {"month": month_start.strftime("%Y-%m")}

        for cat in categories:
            q = await session.execute(
                select(func.sum(Transaction.amount)).where(
                    Transaction.account_id == account_id,
                    Transaction.category == cat,
                    Transaction.amount < 0,
                    Transaction.tx_date >= month_start,
                    Transaction.tx_date < month_end,
                )
            )
            val = q.scalar() or Decimal("0")
            row[cat] = float(abs(val))

        q_other = await session.execute(
            select(func.sum(Transaction.amount)).where(
                Transaction.account_id == account_id,
                Transaction.category.notin_(categories + ["income", "transfer"]),
                Transaction.amount < 0,
                Transaction.tx_date >= month_start,
                Transaction.tx_date < month_end,
            )
        )
        other_total = q_other.scalar() or Decimal("0")
        row["other"] = float(abs(other_total))

        result.append(row)

    return result
