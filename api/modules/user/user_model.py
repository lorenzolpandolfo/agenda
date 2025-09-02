from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from api.modules.db.db import Base


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False)
    status = Column(String, nullable=False)
    crp = Column(String, nullable=False, unique=True)
    phone = Column(String, unique=True)
    bio = Column(String)
    image_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
