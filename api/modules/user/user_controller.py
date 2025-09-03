from uuid import UUID

from fastapi import APIRouter, Depends, Security
from fastapi_jwt import JwtAuthorizationCredentials
from sqlalchemy.orm import Session

from api.modules.db.db import get_db
from api.modules.security.security_service import SecurityService
from api.modules.user.request.user_login_request import UserLoginRequest
from api.modules.user.request.user_register_request import UserRegisterRequest
from api.modules.user.user_mapper import UserMapper
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
    user: User = service.login(data)
    user_data_response = UserMapper.to_user_response_login(user)

    tokens = get_security_service().auth(subject={"user_data": user_data_response})

    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "user_data": user_data_response,
    }


@router.post("/register")
async def register(
    data: UserRegisterRequest, service: UserService = Depends(get_user_service)
):
    user: User = service.register(data)

    return {
        "user_id": user.id,
        "name": user.name,
        "bio": user.bio,
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "crp": user.crp,
        "image_url": user.image_url,
        "created_at": user.created_at,
    }


@router.get("/verify-crp")
async def verifiy_crp(
    user_id: UUID | None = None,
    service: UserService = Depends(get_user_service),
    credentials: JwtAuthorizationCredentials = Security(
        get_security_service().access_security
    ),
):
    user: User = service.verify_crp(
        user_id, credentials.subject.get("user_data").get("user_id")
    )

    return {"user_id": user.id, "crp": user.crp, "status": user.status}


@router.get("")
async def get_user(
    user_id: str | None = None,
    service: UserService = Depends(get_user_service),
    credentials: JwtAuthorizationCredentials = Security(
        get_security_service().access_security
    ),
):
    user: User = service.get_user_data(user_id, credentials.subject)

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role,
        "status": user.status,
        "crp": user.crp,
        "phone": user.phone,
        "bio": user.bio,
        "image_url": user.image_url,
        "created_at": user.created_at,
    }
