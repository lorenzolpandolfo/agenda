import uuid

from sqlalchemy import Column, DateTime, func
from sqlalchemy.dialects.postgresql import UUID

from api.modules.db.db import Base


class Schedule(Base):
    __tablename__ = "schedule"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    professional_id: UUID = Column(UUID(as_uuid=True), nullable=False)
    patient_id: UUID = Column(UUID(as_uuid=True), nullable=False)
    availability_id: UUID = Column(UUID(as_uuid=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
