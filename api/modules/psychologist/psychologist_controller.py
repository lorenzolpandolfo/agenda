from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from api.modules.db.db import SessionLocal
from api.modules.psychologist.psychologist_service import PsychologistService
from api.modules.security.security_service import SecurityService
from fastapi_jwt import JwtAuthorizationCredentials
from fastapi import Security

router = APIRouter(prefix="/psychologists", tags=["psychologists"])

security_service = SecurityService()

# Dependency para pegar sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/{psychologist_id}")
def get_psychologist(
    psychologist_id: str,
    credentials: JwtAuthorizationCredentials = Security(security_service.access_security),
    db: Session = Depends(get_db)
):
    service = PsychologistService(db)
    psychologist = service.get_psychologist(psychologist_id)
    if not psychologist:
        raise HTTPException(status_code=404, detail="Psychologist not found")
    return psychologist
