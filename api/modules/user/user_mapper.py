from api.enum.user_roles_enum import UserRolesEnum
from api.enum.user_status_enum import UserStatusEnum
from api.modules.user.request.user_register_request import UserRegisterRequest
from api.modules.user.response.user_response import UserResponse
from api.modules.user.response.user_subject_response import UserSubjectResponse
from api.modules.user.user_model import User


class UserMapper:

    @staticmethod
    def to_user_response(user: User) -> UserResponse:
        return UserResponse.model_validate(user, from_attributes=True)

    @staticmethod
    def user_register_request_to_user(
        request: UserRegisterRequest, password_hash: str
    ) -> User:
        return User(
            email=request.email,
            password_hash=password_hash,
            name=request.name,
            role=UserRolesEnum.PROFESSIONAL if request.crp else UserRolesEnum.PATIENT,
            status=(
                UserStatusEnum.WAITING_VALIDATION
                if request.crp
                else UserStatusEnum.READY
            ),
            crp=request.crp if request.crp else None,
            phone=request.phone if request.phone else None,
            bio=request.bio if request.bio else None,
            image_url=request.image_url if request.image_url else None,
        )

    @staticmethod
    def to_user_subject_response(user) -> UserSubjectResponse:
        return UserSubjectResponse.model_validate(user, from_attributes=True)
