import uuid

from sqlalchemy import Column, DateTime, Enum, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.enum.user_roles_enum import UserRolesEnum
from api.enum.user_status_enum import UserStatusEnum
from api.modules.db.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRolesEnum, name="role"), nullable=False)
    status = Column(Enum(UserStatusEnum, name="status"), nullable=False)
    crp = Column(String, nullable=False, unique=True)
    phone = Column(String, unique=True)
    bio = Column(String)
    image_url = Column(String)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    availabilities = relationship("Availabilities", back_populates="user")
