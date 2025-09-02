from fastapi import HTTPException
from starlette import status

from api.modules.enum.enum_user_roles import UserRoles
from api.modules.user.user_model import User


class UserValidator:

    @staticmethod
    def validate_user_professional(owner_user: User):
        if owner_user.role != str(UserRoles.PROFESSIONAL):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to perform this action.")