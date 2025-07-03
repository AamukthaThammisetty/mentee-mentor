# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app import models, database
from app.routes import users,protected
from app.routes import mentors,mentees,mentorship,messages


models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for all origins (not recommended in prod)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(users.router, prefix="/api")
app.include_router(protected.router, prefix="/api")
app.include_router(mentors.router)
app.include_router(mentees.router)
app.include_router(mentorship.router)
app.include_router(messages.router)
