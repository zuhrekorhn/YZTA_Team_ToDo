from fastapi import FastAPI
from .database import engine, Base
from .models import user, reaction, todo
from .routers import auth, todos

Base.metadata.create_all(bind=engine)

app = FastAPI(title ="Team Todo API")

app.include_router(auth.router)
app.include_router(todos.router)

@app.get("/")
async def root():
    return {"message": "team todo community API is running"}
