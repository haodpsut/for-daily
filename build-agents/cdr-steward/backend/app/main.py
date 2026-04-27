import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .db import Base, engine
from . import models  # noqa: F401 — register models
from .routers import imports as imports_router
from .routers import programs as programs_router
from .routers import render as render_router
from .routers import plos as plos_router
from .routers import courses as courses_router

app = FastAPI(title="CĐR Steward", version="0.2.0")

# CORS: Vite dev + production Vercel domain (set via env on Render)
default_origins = ["http://localhost:5173", "http://127.0.0.1:5173"]
extra_origins = [o.strip() for o in os.getenv("ALLOWED_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=default_origins + extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health():
    return {"status": "ok", "version": "0.2.0"}


app.include_router(imports_router.router, prefix="/api/import", tags=["import"])
app.include_router(programs_router.router, prefix="/api/programs", tags=["programs"])
app.include_router(render_router.router, prefix="/api/render", tags=["render"])
app.include_router(plos_router.router, prefix="/api", tags=["plos+pis"])
app.include_router(courses_router.router, prefix="/api", tags=["courses+clos"])
