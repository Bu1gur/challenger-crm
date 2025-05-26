from fastapi import FastAPI, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine, Base
import models
from pydantic import BaseModel
from typing import List, Optional

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS для фронта
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# --- Pydantic схемы ---
class ClientBase(BaseModel):
    contract_number: Optional[str] = None
    name: str
    surname: str
    phone: str
    address: Optional[str] = None
    birth_date: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    subscription_period: Optional[str] = None
    payment_amount: Optional[str] = None
    payment_method: Optional[str] = None
    group: Optional[str] = None
    comment: Optional[str] = None
    status: Optional[str] = "Активен"
    paid: Optional[bool] = False
    total_sessions: Optional[int] = 0
    has_discount: Optional[bool] = False
    discount_reason: Optional[str] = None
    deleted: Optional[bool] = False
    trainer: Optional[str] = None

class ClientCreate(ClientBase):
    pass
class ClientUpdate(ClientBase):
    pass
class ClientOut(ClientBase):
    id: int
    class Config:
        orm_mode = True

# --- Клиенты ---
@app.get("/clients", response_model=List[ClientOut])
def get_clients(db: Session = Depends(get_db)):
    return db.query(models.Client).all()

@app.post("/clients", response_model=ClientOut)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    db_client = models.Client(**client.dict())
    db.add(db_client)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.put("/clients/{client_id}", response_model=ClientOut)
def update_client(client_id: int, client: ClientUpdate, db: Session = Depends(get_db)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    for key, value in client.dict(exclude_unset=True).items():
        setattr(db_client, key, value)
    db.commit()
    db.refresh(db_client)
    return db_client

@app.delete("/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    db_client = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not db_client:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(db_client)
    db.commit()
    return {"ok": True}

# --- Тренеры ---
class TrainerBase(BaseModel):
    name: str
    phone: Optional[str] = None
    comment: Optional[str] = None
class TrainerCreate(TrainerBase):
    pass
class TrainerUpdate(TrainerBase):
    pass
class TrainerOut(TrainerBase):
    id: int
    class Config:
        orm_mode = True

@app.get("/trainers", response_model=List[TrainerOut])
def get_trainers(db: Session = Depends(get_db)):
    return db.query(models.Trainer).all()

@app.post("/trainers", response_model=TrainerOut)
def create_trainer(trainer: TrainerCreate, db: Session = Depends(get_db)):
    db_trainer = models.Trainer(**trainer.dict())
    db.add(db_trainer)
    db.commit()
    db.refresh(db_trainer)
    return db_trainer

@app.put("/trainers/{trainer_id}", response_model=TrainerOut)
def update_trainer(trainer_id: int, trainer: TrainerUpdate, db: Session = Depends(get_db)):
    db_trainer = db.query(models.Trainer).filter(models.Trainer.id == trainer_id).first()
    if not db_trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    for key, value in trainer.dict(exclude_unset=True).items():
        setattr(db_trainer, key, value)
    db.commit()
    db.refresh(db_trainer)
    return db_trainer

@app.delete("/trainers/{trainer_id}")
def delete_trainer(trainer_id: int, db: Session = Depends(get_db)):
    db_trainer = db.query(models.Trainer).filter(models.Trainer.id == trainer_id).first()
    if not db_trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    db.delete(db_trainer)
    db.commit()
    return {"ok": True}

# --- Группы ---
class GroupBase(BaseModel):
    name: str
    days: Optional[str] = None
    time_start: Optional[str] = None
    time_end: Optional[str] = None
    comment: Optional[str] = None
class GroupCreate(GroupBase):
    pass
class GroupUpdate(GroupBase):
    pass
class GroupOut(GroupBase):
    id: int
    class Config:
        orm_mode = True

@app.get("/groups", response_model=List[GroupOut])
def get_groups(db: Session = Depends(get_db)):
    return db.query(models.Group).all()

@app.post("/groups", response_model=GroupOut)
def create_group(group: GroupCreate, db: Session = Depends(get_db)):
    db_group = models.Group(**group.dict())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group

@app.put("/groups/{group_id}", response_model=GroupOut)
def update_group(group_id: int, group: GroupUpdate, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    for key, value in group.dict(exclude_unset=True).items():
        setattr(db_group, key, value)
    db.commit()
    db.refresh(db_group)
    return db_group

@app.delete("/groups/{group_id}")
def delete_group(group_id: int, db: Session = Depends(get_db)):
    db_group = db.query(models.Group).filter(models.Group.id == group_id).first()
    if not db_group:
        raise HTTPException(status_code=404, detail="Group not found")
    db.delete(db_group)
    db.commit()
    return {"ok": True}
