from uuid import UUID

from pydantic import BaseModel


class ScheduleCreateRequest(BaseModel):
    availability_id: UUID
