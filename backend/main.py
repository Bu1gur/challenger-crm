import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from database import SessionLocal, engine, Base
import models
from pydantic import BaseModel
from typing import List, Optional
import json
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS для фронта
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:5174").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
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
        from_attributes = True

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
        from_attributes = True

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
        from_attributes = True

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

# --- Периоды абонементов ---
class PeriodBase(BaseModel):
    label: str
    value: str
    months: int
    price: float
    trainings: int

class PeriodCreate(PeriodBase):
    pass
class PeriodUpdate(PeriodBase):
    pass
class PeriodOut(PeriodBase):
    id: int
    class Config:
        from_attributes = True

@app.get("/periods", response_model=List[PeriodOut])
def get_periods(db: Session = Depends(get_db)):
    return db.query(models.Period).all()

@app.post("/periods", response_model=PeriodOut)
def create_period(period: PeriodCreate, db: Session = Depends(get_db)):
    db_period = models.Period(**period.dict())
    db.add(db_period)
    db.commit()
    db.refresh(db_period)
    return db_period

@app.put("/periods/{period_id}", response_model=PeriodOut)
def update_period(period_id: int, period: PeriodUpdate, db: Session = Depends(get_db)):
    db_period = db.query(models.Period).filter(models.Period.id == period_id).first()
    if not db_period:
        raise HTTPException(status_code=404, detail="Period not found")
    for key, value in period.dict(exclude_unset=True).items():
        setattr(db_period, key, value)
    db.commit()
    db.refresh(db_period)
    return db_period

@app.delete("/periods/{period_id}")
def delete_period(period_id: int, db: Session = Depends(get_db)):
    db_period = db.query(models.Period).filter(models.Period.id == period_id).first()
    if not db_period:
        raise HTTPException(status_code=404, detail="Period not found")
    db.delete(db_period)
    db.commit()
    return {"ok": True}

# --- Способы оплаты ---
class PaymentBase(BaseModel):
    label: str
    value: str
    type: str
    banks: Optional[List[str]] = []

class PaymentCreate(PaymentBase):
    pass
class PaymentUpdate(PaymentBase):
    pass
class PaymentOut(PaymentBase):
    id: int
    class Config:
        from_attributes = True

@app.get("/payments", response_model=List[PaymentOut])
def get_payments(db: Session = Depends(get_db)):
    payments = db.query(models.Payment).all()
    # Deserialize JSON fields
    for payment in payments:
        if payment.banks:
            try:
                payment.banks = json.loads(payment.banks)
            except:
                payment.banks = []
        else:
            payment.banks = []
    return payments

@app.post("/payments", response_model=PaymentOut)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db)):
    payment_dict = payment.dict()
    # Serialize JSON fields
    if payment_dict.get('banks'):
        payment_dict['banks'] = json.dumps(payment_dict['banks'])
    
    db_payment = models.Payment(**payment_dict)
    db.add(db_payment)
    db.commit()
    db.refresh(db_payment)
    
    # Deserialize for response
    if db_payment.banks:
        try:
            db_payment.banks = json.loads(db_payment.banks)
        except:
            db_payment.banks = []
    return db_payment

@app.put("/payments/{payment_id}", response_model=PaymentOut)
def update_payment(payment_id: int, payment: PaymentUpdate, db: Session = Depends(get_db)):
    db_payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    for key, value in payment.dict(exclude_unset=True).items():
        if key == 'banks' and value:
            value = json.dumps(value)
        setattr(db_payment, key, value)
    
    db.commit()
    db.refresh(db_payment)
    
    # Deserialize for response
    if db_payment.banks:
        try:
            db_payment.banks = json.loads(db_payment.banks)
        except:
            db_payment.banks = []
    return db_payment

@app.delete("/payments/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db)):
    db_payment = db.query(models.Payment).filter(models.Payment.id == payment_id).first()
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    db.delete(db_payment)
    db.commit()
    return {"ok": True}

# --- Настройки заморозки ---
class FreezeSettingsBase(BaseModel):
    maxDays: int = 30
    reasons: List[str] = []
    requireConfirm: bool = False

class FreezeSettingsCreate(FreezeSettingsBase):
    pass
class FreezeSettingsUpdate(FreezeSettingsBase):
    pass
class FreezeSettingsOut(FreezeSettingsBase):
    id: int
    class Config:
        from_attributes = True

@app.get("/freezeSettings", response_model=List[FreezeSettingsOut])
def get_freeze_settings(db: Session = Depends(get_db)):
    settings = db.query(models.FreezeSettings).all()
    # Deserialize JSON fields
    for setting in settings:
        if setting.reasons:
            try:
                setting.reasons = json.loads(setting.reasons)
            except:
                setting.reasons = []
        else:
            setting.reasons = []
    return settings

@app.post("/freezeSettings", response_model=FreezeSettingsOut)
def create_freeze_settings(freeze_settings: FreezeSettingsCreate, db: Session = Depends(get_db)):
    settings_dict = freeze_settings.dict()
    # Serialize JSON fields
    if settings_dict.get('reasons'):
        settings_dict['reasons'] = json.dumps(settings_dict['reasons'])
    
    db_freeze_settings = models.FreezeSettings(**settings_dict)
    db.add(db_freeze_settings)
    db.commit()
    db.refresh(db_freeze_settings)
    
    # Deserialize for response
    if db_freeze_settings.reasons:
        try:
            db_freeze_settings.reasons = json.loads(db_freeze_settings.reasons)
        except:
            db_freeze_settings.reasons = []
    return db_freeze_settings

@app.put("/freezeSettings/{settings_id}", response_model=FreezeSettingsOut)
def update_freeze_settings(settings_id: int, freeze_settings: FreezeSettingsUpdate, db: Session = Depends(get_db)):
    db_freeze_settings = db.query(models.FreezeSettings).filter(models.FreezeSettings.id == settings_id).first()
    if not db_freeze_settings:
        raise HTTPException(status_code=404, detail="Freeze settings not found")
    
    for key, value in freeze_settings.dict(exclude_unset=True).items():
        if key == 'reasons' and value:
            value = json.dumps(value)
        setattr(db_freeze_settings, key, value)
    
    db.commit()
    db.refresh(db_freeze_settings)
    
    # Deserialize for response
    if db_freeze_settings.reasons:
        try:
            db_freeze_settings.reasons = json.loads(db_freeze_settings.reasons)
        except:
            db_freeze_settings.reasons = []
    return db_freeze_settings

@app.delete("/freezeSettings/{settings_id}")
def delete_freeze_settings(settings_id: int, db: Session = Depends(get_db)):
    db_freeze_settings = db.query(models.FreezeSettings).filter(models.FreezeSettings.id == settings_id).first()
    if not db_freeze_settings:
        raise HTTPException(status_code=404, detail="Freeze settings not found")
    db.delete(db_freeze_settings)
    db.commit()
    return {"ok": True}

# Static files for production deployment
static_dir = os.path.join(os.path.dirname(__file__), "static")
print(f"Checking for static directory: {static_dir}")
print(f"Directory exists: {os.path.exists(static_dir)}")

# Debug endpoint to check file structure
@app.get("/api/debug")
async def debug_info():
    try:
        return {
            "cwd": os.getcwd(),
            "static_dir": static_dir,
            "static_exists": os.path.exists(static_dir),
            "root_files": os.listdir('.') if os.path.exists('.') else [],
            "backend_files": os.listdir('backend') if os.path.exists('backend') else [],
            "static_files": os.listdir(static_dir) if os.path.exists(static_dir) else []
        }
    except Exception as e:
        return {"error": str(e)}

if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    @app.get("/")
    async def serve_spa():
        index_path = os.path.join(static_dir, "index.html")
        print(f"Serving index.html from: {index_path}")
        return FileResponse(index_path)
    
    @app.get("/{full_path:path}")
    async def serve_spa_routes(full_path: str):
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi"):
            raise HTTPException(status_code=404, detail="Not found")
        index_path = os.path.join(static_dir, "index.html")
        return FileResponse(index_path)
else:
    print(f"Static directory not found at {static_dir}")
    print(f"Current working directory: {os.getcwd()}")
    print(f"Directory contents: {os.listdir('.')}")
    
    @app.get("/")
    async def serve_debug():
        return {"message": "Static files not found", "cwd": os.getcwd(), "static_dir": static_dir}
