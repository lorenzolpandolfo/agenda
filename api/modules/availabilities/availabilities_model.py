import uuid

from sqlalchemy import Column, DateTime, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.enum.availability_status_enum import AvailabilityStatusEnum
from api.modules.db.db import Base


class Availabilities(Base):
    __tablename__ = "availabilities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    owner_id = Column(UUID(as_uuid=True), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    status = Column(Enum(AvailabilityStatusEnum, name="status"), nullable=False)

    schedules = relationship("Schedule", back_populates="availability")
