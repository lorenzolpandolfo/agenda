from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from api.enum.user_roles_enum import UserRolesEnum
from api.enum.user_status_enum import UserStatusEnum


class UserResponse(BaseModel):
    id: UUID
    name: str
    bio: str | None = None
    email: str
    role: UserRolesEnum
    status: UserStatusEnum
    crp: str | None = None
    image_url: str | None = None
    created_at: datetime

    class Config:
        from_attributes = True
