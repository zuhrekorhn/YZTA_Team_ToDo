from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from ..database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key = True, index  = True)
    username = Column(String, unique  = True, index =True) #index true db de kullanıcı hızlı bulmayı sağlar. indeks yoksa baştan sona teker teker bakar
    email = Column(String, unique = True, index= True)
    hashed_password =Column(String)

    #oyunlaştırma ve profil
    daily_mood = Column(String, nullable= True) #bugün nasıl hissediyorsun
    current_streak = Column(Integer, default=0) #ardışık gün sayısı
    last_completion_date = Column(DateTime, nullable= True)

    #ilişkiler
    todos = relationship("Todo", back_populates = "owner")
    reactions = relationship("Reaction", back_populates = "user")