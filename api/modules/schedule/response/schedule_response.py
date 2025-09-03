from datetime import datetime
from uuid import UUID

from api.enum.availability_status_enum import AvailabilityStatusEnum
from api.modules.schedule.schedule_model import Schedule


class ScheduleResponse:
    id: UUID
    professional_id: UUID
    patient_id: UUID
    availability_id: UUID
    created_at: datetime
    start_time: datetime
    status: AvailabilityStatusEnum

    def __init__(self, schedule: Schedule):
        self.id = schedule.id
        self.professional_id = schedule.professional_id
        self.patient_id = schedule.patient_id
        self.availability_id = schedule.availability_id
        self.status = schedule.availability.status
        self.start_time = schedule.availability.start_time
        self.created_at = schedule.created_at
