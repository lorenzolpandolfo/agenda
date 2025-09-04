from uuid import UUID

from fastapi import HTTPException, status
from passlib.context import CryptContext
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from api.enum.user_status_enum import UserStatusEnum
from api.modules.user.request.user_login_request import UserLoginRequest
from api.modules.user.request.user_register_request import UserRegisterRequest
from api.modules.user.response.user_response import UserResponse
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

    def get_user_data(self, user_id, credentials_subject) -> UserResponse:
        if not user_id:
            user_id = credentials_subject.get("user_id")

        user: User = self.__repo.find_by_id(user_id)

        UserValidator.validate_user(user)

        return UserMapper.to_user_response(user)

    def login(self, data: UserLoginRequest) -> UUID:
        user = self.__repo.find_by_email(data.email)

        if not user or not pwd_context.verify(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email or password",
            )

        return user.id

    def register(self, data: UserRegisterRequest) -> UserResponse:
        user = UserMapper.user_register_request_to_user(
            request=data, password_hash=hash_password(data.password)
        )

        try:
            user: User = self.__repo.save(user)

            return UserMapper.to_user_response(user)

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

        user_to_verify.status = str(UserStatusEnum.READY)

        return self.__repo.save(user_to_verify)

    def get_all_users(self, role_filter, skip, limit):
        if role_filter:
            users = self.__repo.find_all_by_role(role_filter, skip, limit)

        else:
            users = self.__repo.find_all(skip, limit)

        return [UserMapper.to_user_response(u) for u in users]
