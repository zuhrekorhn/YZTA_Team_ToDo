from typing import Annotated
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.reaction import Reaction
from app.models.todo import Todo
from app.models.user import User
from app.routers.auth import get_current_user

router = APIRouter(
    prefix = "/social",
    tags = ["Social Feed"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

#Anasayfa akışı : diğer kullanıcıların public ve günlük görevlerini getirir
@router.get("/feed")
async def get_social_feed(user: user_dependency, db: db_dependency):
    # benm dışımdaki diğer kullanıcıları ve onların moodlarını çekelim
    # sadece is_public= true ve is_daily=true olan göreleri getirelim
    feed = db.query(User).filter(User.id != user.get("id")).all()

    result = []
    for other_user in feed:
    #her kullanıcının sadece public ve günlük todolarını filtreliyoruz
        public_todos = db.query(Todo).filter(
    Todo.user_id == other_user.id,
            Todo.is_public == True,
            Todo.is_daily == True
        ).all()
        todos_with_reactions =[]
        for todo in public_todos: #her bir göreve verilmiş tepkileri çek
            reactions = db.query(Reaction).filter(Reaction.todo_id == todo.id).all()
            #görevi tepkileri birleştiriyoruz
            todos_with_reactions.append({
                "id": todo.id,
                "title": todo.title,
                "description": todo.description,
                "category": todo.category,
                "is_completed": todo.is_completed,
                "reactions": reactions #göreve gelen tüm emojiler burada
            })

    #eğer kullanıcın gösterilecek todoları varsa listeye ekle
        result.append({
            "username": other_user.username,
            "daily_mood": other_user.daily_mood,
            "streak": other_user.current_streak,
            "todos": todos_with_reactions
        })
    return result
