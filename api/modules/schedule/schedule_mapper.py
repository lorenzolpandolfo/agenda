from api.modules.schedule.response.schedule_response import ScheduleResponse
from api.modules.schedule.schedule_model import Schedule


class ScheduleMapper:

    @staticmethod
    def to_schedule(professional_id, patient_id, availability_id):
        return Schedule(
            professional_id=professional_id,
            patient_id=patient_id,
            availability_id=availability_id,
        )

    @staticmethod
    def to_schedule_response(schedule: Schedule):
        return ScheduleResponse(schedule=schedule)
