from datetime import datetime

from pydantic import BaseModel, model_validator

from api.enum.enum_availability_status import AvailabilityStatus


class AvailabilitiesCreateRequest(BaseModel):
    start_time: datetime
    end_time: datetime
    status: AvailabilityStatus

    @model_validator(mode="after")
    def check_time_order(self):
        if self.start_time >= self.end_time:
            raise ValueError("Invalid start_time or end_time")
        return self
