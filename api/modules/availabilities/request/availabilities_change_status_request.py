from uuid import UUID

from pydantic import BaseModel, field_validator

from api.enum.availability_status_enum import AvailabilityStatusEnum


class AvailabilitiesUpdateStatusRequest(BaseModel):
    availability_id: UUID
    status: AvailabilityStatusEnum

    @field_validator("status")
    def validate_status(cls, v):
        if not AvailabilityStatusEnum(v):
            return ValueError(
                "Invalid availability status (must be AVAILABLE, TAKEN, COMPLETED, or CANCELED)"
            )
        return v
