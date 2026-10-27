from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import init_db
from app.core.seed import seed_initial_claims
from app.api.health import router as health_router
from app.api.claims import router as claims_router
from app.api.analyses import router as analyses_router
from app.api.satellite import router as satellite_router

# Ensure tables and seed records exist
init_db()
seed_initial_claims()

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    seed_initial_claims()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description=(
        "TerraProof: Satellite-Based Environmental Evidence & Agricultural Insurance Claim Verification System. "
        "Integrates multi-spectral Earth observation (Sentinel-2), SAR (Sentinel-1), and meteorological records "
        "into a technical decision-support platform."
    ),
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(claims_router, prefix="/api/v1")
app.include_router(analyses_router, prefix="/api/v1")
app.include_router(satellite_router, prefix="/api/v1")

@app.get("/")
def root():
    return {
        "message": "Welcome to TerraProof API",
        "docs_url": "/docs",
        "health_check": "/api/v1/health",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.API_HOST, port=settings.API_PORT, reload=settings.DEBUG)
