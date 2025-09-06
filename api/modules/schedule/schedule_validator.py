from fastapi import HTTPException

from api.modules.schedule.schedule_model import Schedule
from api.modules.user.user_model import User


class ScheduleValidator:

    @staticmethod
    def validate_schedule(schedule: Schedule):
        if schedule is None:
            raise HTTPException(
                status_code=404,
                detail="Schedule not found",
            )

    @classmethod
    def validate_delete_schedule(cls, schedule: Schedule, user: User):
        if user.id != schedule.patient_id:
            raise HTTPException(
                status_code=403,
                detail="You are not allowed to delete this schedule",
            )