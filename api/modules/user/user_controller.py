from uuid import UUID

from fastapi import APIRouter, Depends, Security
from fastapi_jwt import JwtAuthorizationCredentials
from sqlalchemy.orm import Session

from api.enum.user_roles_enum import UserRolesEnum
from api.modules.db.db import get_db
from api.modules.security.security_service import SecurityService
from api.modules.user.request.user_login_request import UserLoginRequest
from api.modules.user.request.user_register_request import UserRegisterRequest
from api.modules.user.user_model import User
from api.modules.user.user_service import UserService


def get_user_service(db: Session = Depends(get_db)):
    return UserService(db)


def get_security_service():
    return SecurityService()


router = APIRouter(
    prefix="/user",
    tags=["user"],
)


@router.post("/login")
async def login(
    data: UserLoginRequest, service: UserService = Depends(get_user_service)
):
    user_id: UUID = service.login(data)

    tokens = get_security_service().auth({"user_id": str(user_id)})

    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "user_id": user_id,
    }


@router.post("/register")
async def register(
    data: UserRegisterRequest, service: UserService = Depends(get_user_service)
):
    return service.register(data)


@router.get("/verify-crp")
async def verify_crp(
    user_id: UUID | None = None,
    service: UserService = Depends(get_user_service),
    credentials: JwtAuthorizationCredentials = Security(
        get_security_service().access_security
    ),
):
    user: User = service.verify_crp(user_id, credentials.subject.get("user_id"))

    return {"user_id": user.id, "crp": user.crp, "status": user.status}


@router.get("")
async def get_user(
    user_id: str | None = None,
    service: UserService = Depends(get_user_service),
    credentials: JwtAuthorizationCredentials = Security(
        get_security_service().access_security
    ),
):
    return service.get_user_data(user_id, credentials.subject)


@router.get("/all")
async def get_all_users(
    role: UserRolesEnum | None = None,
    skip: int | None = 0,
    limit: int | None = 50,
    service: UserService = Depends(get_user_service),
    credentials: JwtAuthorizationCredentials = Security(
        get_security_service().access_security
    ),
):
    return service.get_all_users(role, skip, limit)
