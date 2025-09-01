from fastapi import APIRouter, Security
from fastapi_jwt import JwtAuthorizationCredentials

from api.modules.security.security_service import SecurityService

security_service = SecurityService()

router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@router.get("/me")
def read_current_user(credentials: JwtAuthorizationCredentials = Security(security_service.access_security)):
    return {"username": credentials}