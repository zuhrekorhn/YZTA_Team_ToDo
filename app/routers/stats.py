from fastapi import APIRouter
from fastapi.params import Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import Annotated

from app.database import SessionLocal
from app.models.todo import Todo
from app.models.user import User
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
    
    # Sıralama hesabı
    # Kullanıcının mevcut streak'ini bul
    user_obj = db.query(User).filter(User.id == user_id).first()
    rank = 0
    if user_obj:
        # Kendisinden daha yüksek streak'i olan kişi sayısı + 1 = Sıralama
        better_users_count = db.query(User).filter(User.current_streak > user_obj.current_streak).count()
        rank = better_users_count + 1

    return{
        "summary": {
            "total": total_task,
            "completed": completed_tasks,
            "completion_rate": completion_rate,
            "rank": rank
        },
        #db den gelen garip görünümlü listeyi frontendin anlayacağı şekle çeviri
        # cat.value :enum olark tanımladığımız kategorinin string karşılığını alır
        "by_category": {cat.value: count for cat, count in category_counts},
    }

@router.get("/user/{target_user_id}")
async def get_user_stats(user: user_dependency, db: db_dependency, target_user_id: int):
    # Public todolar üzerinden istatistik verelim veya tümü?
    # Genelde istatistikler public olabilir
    user_id = target_user_id
    
    total_task = db.query(Todo).filter(Todo.user_id == user_id, Todo.is_public == True).count()
    completed_tasks = db.query(Todo).filter(Todo.user_id == user_id, Todo.is_public == True, Todo.is_completed==True).count()

    category_counts = db.query(
        Todo.category,
        func.count(Todo.id)
    ).filter(
        Todo.user_id == user_id,
        Todo.is_public == True,
        Todo.is_completed == True
    ).group_by(Todo.category).all()

    completion_rate= (completed_tasks / total_task * 100)  if total_task > 0 else 0
    
    # Sıralama hesabı
    user_obj = db.query(User).filter(User.id == user_id).first()
    rank = 0
    if user_obj:
        better_users_count = db.query(User).filter(User.current_streak > user_obj.current_streak).count()
        rank = better_users_count + 1

    return{
        "summary": {
            "total": total_task,
            "completed": completed_tasks,
            "completion_rate": completion_rate,
            "rank": rank
        },
        "by_category": {cat.value: count for cat, count in category_counts},
    }

@router.get("/community")
async def get_community_stats(user: user_dependency, db: db_dependency):
    total_completed = db.query(Todo).filter(Todo.is_completed == True).count()
    return {"total_completed": total_completed}