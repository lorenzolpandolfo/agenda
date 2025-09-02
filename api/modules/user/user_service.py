from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from api.modules.enum.enum_user_roles import UserRoles
from api.modules.enum.enum_user_status import UserStatus
from api.modules.user.request.user_login_request import UserLoginRequest
from api.modules.user.request.user_register_request import UserRegisterRequest
from api.modules.user.user_model import User
from api.modules.user.user_repository import UserRepository
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def get_all_users(self):
        return self.repo.find_all()

    def login(self, data: UserLoginRequest) -> User | None:
        user = self.repo.find_by_email(data.email)

        if not user:
            return None

        if not pwd_context.verify(data.password, user.password_hash):
            return None

        return user

    def register(self, data: UserRegisterRequest) -> User:

        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            name=data.name,
            role=str(UserRoles.PROFESSIONAL) if data.crp else str(UserRoles.PATIENT),
            status=(
                str(UserStatus.WAITING_VALIDATION)
                if data.crp
                else str(UserStatus.WAITING_VALIDATION)
            ),
            crp=data.crp if data.crp else None,
            phone=getattr(data, "phone", None),
            bio=getattr(data, "bio", None),
            image_url=getattr(data, "image_url", None),
        )

        try:
            return self.repo.save(user)
        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email or CRP already registered",
            )
