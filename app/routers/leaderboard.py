from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy import desc
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(
    prefix ="/leaderboard",
    tags = ["Leaderboard"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db) ]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.get("/")
async def get_top_users(db: db_dependency, user: user_dependency):
    #en yüksek streake sahip ilk 10 kullanıcıyı getir
    top_users = db.query(User).order_by(desc(User.current_streak)).limit(9).all()

    result = []
    for index, u in enumerate(top_users):
        result.append({
            "rank": index + 1 , #kullanıcının başına sırasını yaza örn:1.ali
            "username":u.username,
            "streak": u.current_streak,
            "mood": u.daily_mood,
            "is_me": u.id == user.get("id") # listenin içinde kendi sıralamaızı bulmak için
        })
    return result