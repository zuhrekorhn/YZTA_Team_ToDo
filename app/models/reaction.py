from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Relationship
from ..database import Base

class Reaction(Base):
    __tablename__ = "reactions"
    id = Column(Integer, primary_key= True)
    emoji_code =Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    todo_id = Column(Integer, ForeignKey("todos.id"))

    user = relationship("User", back_populates="reactions")
    target_todo = relationship("Todo", back_populates="reactions")