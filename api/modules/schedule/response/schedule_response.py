from datetime import datetime
from uuid import UUID

from api.enum.availability_status_enum import AvailabilityStatusEnum
from api.modules.availabilities.response.availabilities_response import (
    AvailabilitiesResponse,
)
from api.modules.schedule.schedule_model import Schedule
from api.modules.user.response.user_response import UserResponse
from api.modules.user.user_mapper import UserMapper


class ScheduleResponse:
    id: UUID
    user: UserResponse
    patient_id: UUID
    availability_id: UUID
    created_at: datetime
    start_time: datetime
    status: AvailabilityStatusEnum
    availabilities: AvailabilitiesResponse

    def __init__(self, schedule: Schedule):
        self.id = schedule.id
        self.patient_id = schedule.patient_id
        self.availability_id = schedule.availability_id
        self.status = schedule.availability.status
        self.start_time = schedule.availability.start_time
        self.created_at = schedule.created_at
        self.user = UserMapper.to_user_response(schedule.availability.user)
