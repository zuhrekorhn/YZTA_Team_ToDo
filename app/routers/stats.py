from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Annotated

from app.database import SessionLocal
from app.models.todo import Todo
from app.routers.auth import get_current_user

router = APIRouter(
    prefix = "/stats",
    tags = ["Statistics"]
)

def  get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session,Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

@router.get("/")
async def get_my_stats(user: user_dependency, db: db_dependency):
    user_id = user.get("id")

    #toplam görev sayısının hesaplanması
    total_task = db.query(Todo).filter(Todo.user_id == user_id).count()
    completed_tasks = db.query(Todo).filter(Todo.user_id == user_id, Todo.is_completed==True).count()

    #kategori bazlı biten görev dağılımının hesaplanması(hangi kategorinin kaç tane tamamalanmış görevi var)
    category_counts = db.query(
        Todo.category,
        func.count(Todo.id)
    ).filter(
        Todo.user_id == user_id,
        Todo.is_completed == True
    ).group_by(Todo.category).all()

    #başarı oranı yani yüzde kaçını bitirmiş
    completion_rate= (completed_tasks / total_task * 100)  if total_task>0 else 0
    return{
        "summary": {
            "total": total_task,
            "completed": completed_tasks,
            "completion_rate": completion_rate,
        },
        #b den gelen gairp görünümlü listeyi frontendin anlayacağı şekle çeviri
        # cat.value :enum olark tanımladığımız kategorinin string karşılığını alır
        "by_category": {cat.value: count for cat, count in category_counts},
    }