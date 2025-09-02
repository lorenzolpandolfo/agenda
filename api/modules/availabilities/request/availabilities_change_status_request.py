from pydantic import BaseModel, field_validator
from uuid import UUID

from api.modules.enum.enum_availability_status import AvailabilityStatus


class AvailabilitiesUpdateStatusRequest(BaseModel):
    availability_id: UUID
    status: AvailabilityStatus

    @field_validator("status")
    def validate_status(cls, v):
        if not AvailabilityStatus(v):
            return ValueError("Invalid availability status (must be AVAILABLE, TAKEN, COMPLETED, or CANCELED)")
        return v
