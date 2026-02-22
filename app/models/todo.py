import enum
from sqlalchemy import Column, Integer, String, DateTime,Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from ..database import Base
import datetime


class TodoCategory(str, enum.Enum):
    moodle = "moodle"
    coursera = "coursera"
    uni = "üniversite"
    personal = "kişisel"
    entertainment = "eğlence"


class Todo(Base):
    __tablename__ ="todos"

    id = Column(Integer, primary_key=True, index = True)
    title = Column(String, index = True)
    description = Column(Text, nullable = True)
    category = Column(Enum(TodoCategory), default = TodoCategory.personal)
    priority = Column(String, default = "Orta")
    due_date = Column(DateTime, nullable = True)

    is_public = Column(Boolean, default = True)
    is_daily = Column(Boolean, default = False)
    is_completed = Column(Boolean, default = False)

    created_at = Column(DateTime, default = datetime.datetime.utcnow)

    #ilişkiler
    user_id = Column(Integer, ForeignKey("users.id"))
    owner =relationship("User", back_populates="todos")
    reactions = relationship("Reaction", back_populates="target_todo")
