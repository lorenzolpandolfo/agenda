from fastapi import HTTPException, status, APIRouter, Security, Depends
from fastapi_jwt import JwtAuthorizationCredentials
from sqlalchemy.orm import Session

from api.modules.db.db import get_db
from api.modules.security.security_service import SecurityService
from api.modules.user.request.user_request_login import UserRequestLogin
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
def login(data: UserRequestLogin, service: UserService = Depends(get_user_service)):

    user = service.login(data)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    tokens = get_security_service().auth(subject={"id": str(user.id)})

    return {
        "access_token": tokens["access_token"],
        "refresh_token": tokens["refresh_token"],
        "user_id": user.id,
    }

@router.get("/me")
def read_current_user(credentials: JwtAuthorizationCredentials = Security(lambda: get_security_service().access_security)):
    return {"username": credentials}