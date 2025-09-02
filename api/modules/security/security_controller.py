from fastapi import APIRouter, Security
from fastapi_jwt import JwtAuthorizationCredentials

from api.modules.security.security_service import SecurityService

security_service = SecurityService()

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/refresh")
def refresh(
    credentials: JwtAuthorizationCredentials = Security(
        security_service.refresh_security
    ),
):
    return security_service.refresh(credentials)
