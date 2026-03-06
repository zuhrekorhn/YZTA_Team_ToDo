from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import relationship

from .database import engine, Base
from .models import user, reaction, todo
from .routers import auth, todos, users, social, reactions, leaderboard, stats

Base.metadata.create_all(bind=engine)

app = FastAPI(title ="Team Todo API")

origins = [
    "http://localhost:5173", # Vite varsayılan portu
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Frontend'in her yerden bağlanmasına izin verir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(todos.router)
app.include_router(users.router)
app.include_router(social.router)
app.include_router(reactions.router)
app.include_router(leaderboard.router)
app.include_router(stats.router)
app.include_router(reactions.router)

@app.get("/")
async def root():
    return {"message": "team todo community API is running"}
