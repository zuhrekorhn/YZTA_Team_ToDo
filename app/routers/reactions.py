from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status

from app.database import SessionLocal
from app.models.reaction import Reaction
from app.routers.auth import get_current_user

router = APIRouter(
    prefix = "/reactions",
    tags = ["Reactions"]
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

db_dependency = Annotated[Session, Depends(get_db)]
user_dependency = Annotated[dict, Depends(get_current_user)]

#şema
class ReactionRequest(BaseModel):
    emoji_code: str
    todo_id: int

@router.post("/", status_code=status.HTTP_201_CREATED)
async def react_to_todo(user: user_dependency, db:db_dependency, reaction_request: ReactionRequest):
    #db de aynı kullnaıcının aynı todoya tepki verip vermediğini konrtol ediyoruz
    existing_reaction =db.query(Reaction).filter(
        Reaction.user_id == user.get("id"),
        Reaction.todo_id == reaction_request.todo_id
    ).first()

    if existing_reaction:
        # Eğer aynı tepki verilmişse, tepkiyi geri al (sil)
        if existing_reaction.emoji_code == reaction_request.emoji_code:
            db.delete(existing_reaction)
            db.commit()
            return {"message": "Tepki geri alındı", "action": "removed"}
        
        # Eğer farklı bir tepki verilmişse, emojiyi güncelle
        existing_reaction.emoji_code = reaction_request.emoji_code
        db.commit()
        return {"message": "Tepki güncellendi", "action": "updated"}

    new_reaction = Reaction(
        emoji_code = reaction_request.emoji_code,
        todo_id = reaction_request.todo_id,
        user_id = user.get("id")
    )

    db.add(new_reaction)
    db.commit()
    return{"message": "Tepki başarıyla gönderildi", "action": "created"}