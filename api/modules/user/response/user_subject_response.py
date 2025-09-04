from uuid import UUID

from pydantic import BaseModel

from api.enum.user_roles_enum import UserRolesEnum


class UserSubjectResponse(BaseModel):
    id: UUID
    role: UserRolesEnum

    class Config:
        from_attributes = True
