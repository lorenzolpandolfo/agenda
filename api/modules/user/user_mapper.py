from typing import Any, Dict

from api.enum.user_roles_enum import UserRolesEnum
from api.enum.user_status_enum import UserStatusEnum
from api.modules.user.request.user_register_request import UserRegisterRequest
from api.modules.user.user_model import User


class UserMapper:

    @staticmethod
    def to_user_response(user: User) -> Dict[str, Any]:
        return {
            "user_id": str(user.id),
            "name": user.name,
            "bio": user.bio,
            "email": user.email,
            "role": str(user.role),
            "status": str(user.status),
            "crp": user.crp,
            "image_url": user.image_url,
            "created_at": str(user.created_at),
        }

    @staticmethod
    def subject_to_user(subject: Dict[str, Any]) -> User:
        return User(
            id=subject.get("user_data").get("user_id"),
            name=subject.get("user_data").get("name"),
            email=subject.get("user_data").get("email"),
            role=subject.get("user_data").get("role"),
            status=subject.get("user_data").get("status"),
            crp=subject.get("user_data").get("crp"),
            phone=subject.get("user_data").get("phone"),
            bio=subject.get("user_data").get("bio"),
            image_url=subject.get("user_data").get("image_url"),
            created_at=subject.get("user_data").get("created_at"),
        )

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
