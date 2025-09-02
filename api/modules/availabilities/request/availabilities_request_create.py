from datetime import datetime
from pydantic import BaseModel, model_validator


class AvailabilitiesRequestCreate(BaseModel):
    start_time: datetime
    end_time: datetime

    @model_validator(mode="after")
    def check_time_order(self):
        if self.start_time >= self.end_time:
            raise ValueError("Invalid start_time or end_time")
        return self
