from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from api.enum.enum_user_roles import UserRoles
from api.enum.enum_user_status import UserStatus
from api.modules.user.request.user_login_request import UserLoginRequest
from api.modules.user.request.user_register_request import UserRegisterRequest
from api.modules.user.user_mapper import UserMapper
from api.modules.user.user_model import User
from api.modules.user.user_repository import UserRepository
from api.modules.user.user_validator import UserValidator

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


class UserService:
    def __init__(self, db: Session):
        self.__repo = UserRepository(db)

    def get_user_data(self, user_id, credentials_subject):
        if not user_id:
            return UserMapper.user_register_request_to_user(subject=credentials_subject)

        return self.__repo.find_by_id(user_id)

    def login(self, data: UserLoginRequest) -> User | None:
        user = self.__repo.find_by_email(data.email)

        if not user or not pwd_context.verify(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email or password",
            )

        return user

    def register(self, data: UserRegisterRequest) -> User:
        user = UserMapper.user_register_request_to_user(
            request=data, password_hash=hash_password(data.password)
        )

        try:
            return self.__repo.save(user)

        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email or CRP already registered",
            )

    def verify_crp(self, user_id_to_verify, current_user_id):
        if not user_id_to_verify:
            user_id_to_verify = current_user_id

        user_to_verify: User = self.__repo.find_by_id(user_id_to_verify)

        UserValidator.validate_user(user_to_verify)
        UserValidator.validate_user_professional(user_to_verify)

        user_to_verify.status = str(UserStatus.READY)

        return self.__repo.save(user_to_verify)
