from fastapi import HTTPException, status, APIRouter, Depends
from sqlalchemy.orm import Session

from api.modules.db.db import get_db
from api.modules.security.security_service import SecurityService
from api.modules.user.request.user_login_request import UserLoginRequest
from api.modules.user.request.user_register_request import UserRegisterRequest
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
    user = service.login(data)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email or password",
        )

    tokens = get_security_service().auth(subject={"user_id": str(user.id)})

    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "user_id": user.id,
    }


@router.post("/register")
async def register(
    data: UserRegisterRequest, service: UserService = Depends(get_user_service)
):
    user = service.register(data)

    return {
        "user_id": user.id,
    }
