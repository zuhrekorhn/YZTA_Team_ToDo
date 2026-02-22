from datetime import date, datetime
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from ..database import SessionLocal
from ..models.todo import Todo, TodoCategory
from .auth import get_current_user


router = APIRouter(
    prefix="/todos",
    tags = ["Todos"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[Session, Depends(get_current_user)]

#şemalar pydantic models => kullanıcıya veri oluşturuken veya güncellerken göndermesi gereken veri kalıbını belirler
class TodoRequest(BaseModel):
    title : str =Field(min_length = 3)
    description: Optional[str] = None
    category: TodoCategory = TodoCategory.personal
    priority: str="Orta"
    due_date :Optional[datetime] = None
    is_public: bool = True
    is_daily: bool =False


#Endpointler

#Todo listeleme
@router.get("/")
async def read_my_todos(user: user_dependency, db:db_dependency):
    return db.query(Todo).filter(Todo.user_id == user.get("id")).all()

#Yeni todo olusturma
@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_todo(user: user_dependency, db:db_dependency, todo_request: TodoRequest):
    new_todo= Todo(
        **todo_request.model_dump(),
        user_id = user.get("id"),
        is_completed = False
    )
    db.add(new_todo)
    db.commit()

#Todo güncelleme
@router.put("/{todo_id}", status_code= status.HTTP_204_NO_CONTENT)
async def update_todo(user: user_dependency, db:db_dependency, todo_request: TodoRequest, todo_id:int):
    todo_model = db.query(Todo).filter(Todo.id ==todo_id).filter(Todo.user_id == user.get("id")).first()
    if todo_model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,detail ="Todo bulunamadı")

    todo_model.title = todo_request.title
    todo_model.description = todo_request.description
    todo_model.category = todo_request.category
    todo_model.priority = todo_request.priority
    todo_model.due_date = todo_request.due_date
    todo_model.is_public = todo_request.is_public
    todo_model.is_daily = todo_request.is_daily

    db.add(todo_model)
    db.commit()

# todo tamamlandı olarak işaretleme
@router.put("/{todo_id}/complete", status_code= status.HTTP_204_NO_CONTENT)
async def complete_todo(user: user_dependency, db:db_dependency, todo_id:int):
    todo_model = db.query(Todo).filter(Todo.id == todo_id).filter(Todo.user_id == user.get("id")).first()
    if todo_model is None:
        raise HTTPException(status_code=404, detail="Todo bulunamadı")

    todo_model.is_completed = True
    db.add(todo_model)
    db.commit()

# Todo Silme
@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(user: user_dependency, db:db_dependency, todo_id:int):
    todo_model = db.query(Todo).filter(Todo.id == todo_id).filter(Todo.user_id == user.get("id")).first()

    if todo_model is None:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail= "Todo bulunamadı")

    db.delete(todo_model)
    db.commit()