from fastapi import HTTPException

from api.enum.enum_availability_status import AvailabilityStatus
from api.enum.enum_user_roles import UserRoles
from api.modules.availabilities.availabilities_model import Availabilities
from api.modules.user.user_model import User


class AvailabilitiesValidator:

    @staticmethod
    def validate_availability(availability: Availabilities):
        if not availability:
            raise HTTPException(status_code=404, detail="Availability not found")

    @staticmethod
    def validate_if_can_schedule(
        availability: Availabilities, user_who_schedules: User
    ):
        AvailabilitiesValidator.validate_availability(availability)

        if availability.status != AvailabilityStatus.AVAILABLE:
            raise HTTPException(
                status_code=400,
                detail="This availability cannot be scheduled.",
            )

        if user_who_schedules.role != str(UserRoles.PATIENT):
            raise HTTPException(
                status_code=403,
                detail="This user can not perform this action.",
            )
