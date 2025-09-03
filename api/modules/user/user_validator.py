from fastapi import HTTPException
from starlette import status

from api.modules.enum.enum_user_roles import UserRoles
from api.modules.enum.enum_user_status import UserStatus
from api.modules.user.user_model import User


class UserValidator:

    @staticmethod
    def validate_user_professional(owner_user: User):
        if str(owner_user.role) != str(UserRoles.PROFESSIONAL):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to perform this action.",
            )

    @staticmethod
    def validate_user_professional_crp_ready(owner_user: User):
        if str(owner_user.status) != str(UserStatus.READY):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User's CRP must be verified to perform this action.",
            )
