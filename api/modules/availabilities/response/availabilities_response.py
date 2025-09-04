from datetime import datetime
from uuid import UUID

from api.enum.availability_status_enum import AvailabilityStatusEnum
from api.modules.availabilities.availabilities_model import Availabilities
from api.modules.user.response.user_response import UserResponse
from api.modules.user.user_mapper import UserMapper


class AvailabilitiesResponse:
    id: UUID
    created_at: datetime
    status: AvailabilityStatusEnum
    start_time: datetime
    end_time: datetime
    user: UserResponse

    def __init__(self, availabilities: Availabilities):
        self.id = availabilities.id
        self.created_at = availabilities.created_at
        self.status = availabilities.status
        self.start_time = availabilities.start_time
        self.end_time = availabilities.end_time
        self.user = UserMapper.to_user_response(availabilities.user)
