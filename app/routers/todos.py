from datetime import date, datetime
from typing import Annotated, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, Date
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from ..database import SessionLocal
from ..models.todo import Todo, TodoCategory
from ..models.reaction import Reaction
from .auth import get_current_user
from ..models.user import User
from datetime import date, datetime, timedelta

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
    #dünden kalan tamamlanmaış todoları genel todo listesine ekelencekşekilde ayarla
    #is_completed false ise is daily trure dan false cevirilecek
    user_id = user.get("id")
    # Clean up logic disabled to allow moving backlog items to sprint without auto-revert
    # today = datetime.utcnow().date()

    # unfinished_daily_tasks = db.query(Todo).filter(
    #     Todo.user_id == user_id,
    #     Todo.is_daily == True,
    #     Todo.is_completed == False,
    #     # created_at tarihini kontrol ederek dünden öncesini buluyoruz
    #     func.cast(Todo.created_at, Date) < today
    # ).all()

    # if unfinished_daily_tasks:
    #     for task in unfinished_daily_tasks:
    #         task.is_daily = False
    #     db.commit()

    todos = db.query(Todo).filter(Todo.user_id == user_id).all()
    results = []
    
    for todo in todos:
        #her bir todoya verilmiş reactionaı çekelim
        reactions = db.query(Reaction).filter(Reaction.todo_id == todo.id).all()
        
        # tepkileri de getirecek şekilde todoları getirme
        todo_data = {
            "id": todo.id,
            "title": todo.title,
            "description": todo.description,
            "category": todo.category,
            "priority": todo.priority,
            "due_date": todo.due_date,
            "is_public": todo.is_public,
            "is_daily": todo.is_daily,
            "is_completed": todo.is_completed,
            "created_at": todo.created_at,
            "user_id": todo.user_id,
            "reactions": [r.emoji_code for r in reactions]
        }
        results.append(todo_data)
        
    return results

# Başka bir kullanıcının PUBLIC todolarını listeleme anasayfada veya incelenmek istenen profil sayfasında gösterilecek
@router.get("/user/{target_user_id}")
async def get_user_todos(user: user_dependency, db: db_dependency, target_user_id: int):
    todos = db.query(Todo).filter(
        Todo.user_id == target_user_id,
        Todo.is_public == True
    ).all()
    
    results = []
    for todo in todos:
        reactions = db.query(Reaction).filter(Reaction.todo_id == todo.id).all()
        todo_data = {
            "id": todo.id,
            "title": todo.title,
            "description": todo.description,
            "category": todo.category,
            "priority": todo.priority,
            "due_date": todo.due_date,
            "is_public": todo.is_public,
            "is_daily": todo.is_daily,
            "is_completed": todo.is_completed,
            "created_at": todo.created_at,
            "user_id": todo.user_id,
            "reactions": [r.emoji_code for r in reactions]
        }
        results.append(todo_data)
    return results

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

#Todo güncelleme Patch (sadece belirli alanları güncellemek için)
@router.patch("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def patch_todo(user: user_dependency, db: db_dependency, todo_id: int, 
                     is_daily: Optional[bool] = None,
                     is_public: Optional[bool] = None):
    
    todo_model = db.query(Todo).filter(Todo.id == todo_id).filter(Todo.user_id == user.get("id")).first()
    if todo_model is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Todo bulunamadı")

    if is_daily is not None:
        todo_model.is_daily = is_daily
    if is_public is not None:
        todo_model.is_public = is_public

    db.add(todo_model)
    db.commit()

# todo tamamlandı olarak işaretleme ve streak arttırma (Toggle özellikli)
@router.put("/{todo_id}/complete", status_code= status.HTTP_204_NO_CONTENT)
async def complete_todo(user: user_dependency, db:db_dependency, todo_id:int):
    todo_model = db.query(Todo).filter(Todo.id == todo_id).filter(Todo.user_id == user.get("id")).first()
    if todo_model is None:
        raise HTTPException(status_code=404, detail="Todo bulunamadı")
    
    # Toggle mantığı: Eğer tamamlanmışsa geri al, değilse tamamla
    if todo_model.is_completed:
        todo_model.is_completed = False
        db.add(todo_model)
        db.commit()
        return

    todo_model.is_completed = True
    db.add(todo_model)
    #streak mantığı (günde min 1 görev)
    db.add(todo_model)
    #streak mantığı (günde min 1 görev)
    user_model =db.query(User).filter(User.id == user.get("id")).first()
    today = date.today()
    yesterday = today - timedelta(days=1)

     # Eğer kullanıcı bugün daha önce işlem yapmadıysa kontrol et
    if user_model.last_active_date != today:

        # --- EĞER DÜN YAPMADIYSA SERİYİ 1'DEN BAŞLAT ---
        if user_model.last_active_date != yesterday and user_model.last_active_date is not None:
            user_model.current_streak = 1
        else:
            # Dün yapmıştı veya yeni kullanıcı, o yüzden seriyi artırıyoruz
            user_model.current_streak += 1
        user_model.last_active_date = today
        db.add(user_model)
    db.commit()

# Todo Silme
@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(user: user_dependency, db:db_dependency, todo_id:int):
    todo_model = db.query(Todo).filter(Todo.id == todo_id).filter(Todo.user_id == user.get("id")).first()

    if todo_model is None:
        raise HTTPException(status_code= status.HTTP_404_NOT_FOUND, detail= "Todo bulunamadı")

    db.delete(todo_model)
    db.commit()