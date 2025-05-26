from sqlalchemy import Column, Integer, String, Boolean, Date, Text, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    contract_number = Column(String, nullable=True)
    name = Column(String, nullable=False)
    surname = Column(String, nullable=False)
    phone = Column(String, nullable=False)
    address = Column(String, nullable=True)
    birth_date = Column(String, nullable=True)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    subscription_period = Column(String, nullable=True)
    payment_amount = Column(String, nullable=True)
    payment_method = Column(String, nullable=True)
    group = Column(String, nullable=True)
    comment = Column(Text, nullable=True)
    status = Column(String, default="Активен")
    paid = Column(Boolean, default=False)
    total_sessions = Column(Integer, default=0)
    has_discount = Column(Boolean, default=False)
    discount_reason = Column(String, nullable=True)
    deleted = Column(Boolean, default=False)
    trainer = Column(String, nullable=True)

class Trainer(Base):
    __tablename__ = "trainers"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    comment = Column(Text, nullable=True)

class Group(Base):
    __tablename__ = "groups"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    days = Column(String, nullable=True)  # Список дней через запятую
    time_start = Column(String, nullable=True)
    time_end = Column(String, nullable=True)
    comment = Column(Text, nullable=True)
