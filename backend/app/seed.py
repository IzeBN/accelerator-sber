import random
from datetime import datetime, timedelta, date
from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User
from app.models.account import Account
from app.models.transaction import Transaction
from app.models.savings import SavingsGoal
from app.models.investment import Investment
from app.models.benefit import Benefit
from app.models.survey import SurveyAnswer
from app.models.document import Document
from app.models.stepan import StepanTip


async def run_seed(session: AsyncSession) -> None:
    result = await session.execute(select(User).limit(1))
    if result.scalar_one_or_none():
        return  # Already seeded

    # Users
    parent = User(
        role="parent",
        full_name="Мария Петрова",
        email="maria@parent.ru",
        phone="+7 905 123-45-67",
        package="standard",
        onboarding_done=True,
        survey_done=False,
    )
    session.add(parent)
    await session.flush()

    student = User(
        role="student",
        full_name="Иван Петров",
        email="ivan@student.ru",
        phone="+7 916 987-65-43",
        university="НИУ ВШЭ",
        birth_date=date(2003, 5, 15),
        parent_id=parent.id,
        package="standard",
        onboarding_done=True,
        survey_done=True,
    )
    session.add(student)

    admin = User(
        role="admin",
        full_name="Администратор СберСтарт",
        email="admin@accelerator-sber.ru",
        package="premium",
        onboarding_done=True,
        survey_done=True,
    )
    session.add(admin)
    await session.flush()

    # Account
    account = Account(user_id=student.id, balance=Decimal("45230.50"))
    session.add(account)
    await session.flush()

    # Transactions: 50 over last 3 months
    now = datetime.utcnow()
    expense_categories = ["food", "transport", "education", "entertainment", "cafe", "supermarket"]
    descriptions = {
        "food": ["Обед в столовой", "Бизнес-ланч", "Фастфуд", "Ланч"],
        "transport": ["Пополнение карты", "Поездка на такси", "Каршеринг", "Транспорт"],
        "education": ["Учебники", "Онлайн-курс", "Распечатка материалов", "Канцелярия"],
        "entertainment": ["Кино", "Боулинг", "Концерт", "Развлечения"],
        "cafe": ["Кофе", "Завтрак в кафе", "Чай и выпечка", "Обед в кафе"],
        "supermarket": ["Продукты", "Супермаркет", "Покупка продуктов", "Бакалея"],
    }

    for i in range(6):
        days_ago = random.randint(1, 88)
        session.add(Transaction(
            account_id=account.id,
            amount=Decimal("15000.00"),
            category="income",
            description="Стипендия",
            tx_date=now - timedelta(days=days_ago),
        ))

    for _ in range(44):
        days_ago = random.randint(0, 90)
        hours = random.randint(8, 22)
        cat = random.choice(expense_categories)
        amount = Decimal(str(round(random.uniform(80, 2500), 2)))
        desc = random.choice(descriptions.get(cat, ["Покупка"]))
        session.add(Transaction(
            account_id=account.id,
            amount=-amount,
            category=cat,
            description=desc,
            tx_date=now - timedelta(days=days_ago, hours=hours),
        ))

    # Savings goals
    session.add(SavingsGoal(
        user_id=student.id,
        title="Ноутбук",
        target_amount=Decimal("60000.00"),
        current_amount=Decimal("23000.00"),
        strategy="round_up",
        deadline=date(2026, 9, 1),
    ))
    session.add(SavingsGoal(
        user_id=student.id,
        title="Отпуск в Санкт-Петербурге",
        target_amount=Decimal("40000.00"),
        current_amount=Decimal("8500.00"),
        strategy="weekly",
        deadline=date(2026, 7, 15),
    ))

    # Investments
    session.add(Investment(
        user_id=student.id,
        instrument="Облигации РФ",
        type="bond",
        amount=Decimal("10000.00"),
        profit_pct=Decimal("4.20"),
    ))
    session.add(Investment(
        user_id=student.id,
        instrument="Фонд акций",
        type="stock_fund",
        amount=Decimal("5000.00"),
        profit_pct=Decimal("-1.30"),
    ))

    # Benefits
    for b in [
        Benefit(title="Кэшбэк 5% в кафе и ресторанах", description="Получайте 5% кэшбэк на все покупки в кафе и ресторанах по карте СберСтарт.", category="cashback", eligible_package="base"),
        Benefit(title="Скидка 20% на транспорт", description="Скидка 20% на поездки в Яндекс.Такси и каршеринг СберКар при оплате картой.", category="transport", eligible_package="base"),
        Benefit(title="Инвестиционный бонус", description="Бонус 500 баллов за первое открытие инвестиционного счёта в СберИнвестиции.", category="investment", eligible_package="base"),
        Benefit(title="СберПрайм для студентов", description="Подписка СберПрайм бесплатно на 6 месяцев: Okko, СберМаркет, Звук и многое другое.", category="subscription", eligible_package="standard"),
        Benefit(title="Кэшбэк 10% на образование", description="Возврат 10% от оплаты онлайн-курсов, учебников и образовательных платформ.", category="cashback", eligible_package="standard"),
        Benefit(title="Скидка 50% в СберЗдоровье", description="Онлайн-консультации врачей со скидкой 50% через приложение СберЗдоровье.", category="health", eligible_package="standard", link="https://sberhealth.ru"),
        Benefit(title="Студенческая стипендия СберСтарт", description="Дополнительная стипендия 3 000 руб/мес для студентов с успеваемостью выше 4.5.", category="scholarship", eligible_package="standard"),
        Benefit(title="Страховка путешественника", description="Бесплатная страховка для путешествий по России и за рубеж. Покрытие до 50 000 €.", category="insurance", eligible_package="premium"),
        Benefit(title="Премиум-обслуживание", description="Приоритетная поддержка 24/7, персональный менеджер, бесплатные переводы без лимита.", category="service", eligible_package="premium"),
        Benefit(title="Льготная ипотека для молодых", description="Специальная ипотечная программа под 5.5% годовых для студентов до 25 лет.", category="mortgage", eligible_package="standard"),
    ]:
        session.add(b)

    # Stepan tips
    for tip in [
        StepanTip(trigger="low_balance", text="Замечаю, что баланс снижается. Попробуй отложить часть следующей стипендии на накопления — даже 500 руб. в неделю дадут 2 000 в месяц!", priority=5),
        StepanTip(trigger="high_food_spend", text="Ты тратишь на еду больше обычного. Готовь дома 2–3 раза в неделю — сэкономишь до 3 000 руб/мес 🍳", priority=4),
        StepanTip(trigger="cashback_reminder", text="У тебя накопился кэшбэк! Не забудь использовать его при следующей покупке в кафе или на транспорте.", priority=3),
        StepanTip(trigger="savings_reminder", text="До твоей цели «Ноутбук» осталось 37 000 ₽. Включи автосохранение 10% от стипендии — и к сентябрю цель будет достигнута!", priority=4),
        StepanTip(trigger="investment_tip", text="Хочешь, чтобы деньги работали? Облигации РФ — отличный старт: минимальный риск и стабильный доход 4–6% годовых.", priority=2),
        StepanTip(trigger="goal_progress", text="Отличный прогресс по цели «Отпуск»! Ты уже накопил 21%. Продолжай в том же духе — до поездки совсем немного! 🎉", priority=3),
        StepanTip(trigger="first_login", text="Добро пожаловать в СберСтарт! Я твой финансовый помощник. Давай настроим бюджет, чтобы деньги всегда хватало до стипендии.", priority=3),
    ]:
        session.add(tip)

    # Document pending moderation
    await session.flush()
    session.add(Document(
        user_id=student.id,
        doc_type="student_id",
        file_url="https://example.com/docs/student_id_ivan.jpg",
        status="pending",
    ))

    # Survey answers
    for sa in [
        SurveyAnswer(user_id=student.id, step=1, question="Откуда у тебя деньги?", answer={"values": ["Стипендия", "Переводы от родителей"]}),
        SurveyAnswer(user_id=student.id, step=2, question="Сколько примерно ты тратишь в месяц?", answer={"value": 18000}),
        SurveyAnswer(user_id=student.id, step=3, question="На что тратишь чаще всего?", answer={"values": ["Еда вне дома", "Транспорт", "Развлечения"]}),
        SurveyAnswer(user_id=student.id, step=4, question="Хочешь ли ты пробовать копить или инвестировать?", answer={"value": "Да, научи меня"}),
        SurveyAnswer(user_id=student.id, step=5, question="Какая у тебя цель?", answer={"value": "Новые наушники"}),
    ]:
        session.add(sa)

    await session.commit()
    print("[seed] ✅ Database seeded successfully")
