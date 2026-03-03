from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from app.database import SessionLocal
from app.models.user import User
from app.routers.auth import db_dependency, get_current_user
from app.routers.todos import user_dependency

router= APIRouter(
    prefix = "/user",
    tags = ["User Profile"]
)
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

#şemalar
class MoodRequest(BaseModel):
    mood: str

#Endpointler
# userın kendi profil bilgilerini getirir
@router.get("/")
async def get_user_profile(user: user_dependency, db:db_dependency):
    user_model = db.query(User).filter(User.id == user.get("id")).first()
    if user_model is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user_model

# Günlük mood güncelleme
@router.put("/mood", status_code= status.HTTP_204_NO_CONTENT)
async def update_user_profile(user: user_dependency, db: db_dependency, mood_request: MoodRequest):
    user_model = db.query(User).filter(User.id == user.get("id")).first()

    user_model.daily_mood = mood_request.mood

    db.add(user_model)
    db.commit()
