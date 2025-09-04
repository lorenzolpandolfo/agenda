from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session
from starlette import status

from api.enum.availability_status_enum import AvailabilityStatusEnum
from api.enum.time_enum import TimeEnum
from api.modules.availabilities.availabilities_model import Availabilities
from api.modules.availabilities.availabilities_repository import (
    AvailabilitiesRepository,
)
from api.modules.availabilities.request.availabilities_change_status_request import (
    AvailabilitiesUpdateStatusRequest,
)
from api.modules.availabilities.request.availabilities_create_request import (
    AvailabilitiesCreateRequest,
)
from api.modules.availabilities.response.availabilities_response import (
    AvailabilitiesResponse,
)
from api.modules.user.user_model import User
from api.modules.user.user_repository import UserRepository
from api.modules.user.user_validator import UserValidator


class AvailabilitiesService:
    def __init__(self, db: Session):
        self.__repo: AvailabilitiesRepository = AvailabilitiesRepository(db)
        self.__user_repo: UserRepository = UserRepository(db)

    def __get_owner_data_by_id(self, owner_id) -> User | None:
        owner_user: User = self.__user_repo.find_by_id(owner_id)

        UserValidator.validate_user(owner_user)
        return owner_user

    def create_availability(self, request: AvailabilitiesCreateRequest, owner_id):
        owner_user: User = self.__get_owner_data_by_id(owner_id)

        UserValidator.validate_user_professional(owner_user)
        UserValidator.validate_user_professional_crp_ready(owner_user)

        if self.__repo.exists_or_overlap(
            request.start_time, request.end_time, owner_id
        ):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="start_time and end_time are conflicting with another availability for this user.",
            )

        availability = Availabilities(
            start_time=request.start_time,
            end_time=request.end_time,
            status=request.status,
            owner_id=owner_id,
        )
        return self.__repo.save(availability)

    def get_availabilities(
        self,
        professional_id: UUID | None,
        time_filter: TimeEnum,
        availability_status: AvailabilityStatusEnum,
    ):
        availability_list = self.__repo.find_all_by_owner_id_status_and_time(
            professional_id, availability_status, time_filter
        )

        if not availability_list:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No availabilities found.",
            )

        return [AvailabilitiesResponse(a) for a in availability_list]

    def change_status(self, request: AvailabilitiesUpdateStatusRequest, owner_id):

        owner_user: User = self.__get_owner_data_by_id(owner_id)

        UserValidator.validate_user_professional(owner_user)
        UserValidator.validate_user_professional_crp_ready(owner_user)

        availability: Availabilities = self.__repo.find_by_id(request.availability_id)

        if not availability:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No availabilities found for this availability_id.",
            )

        if str(availability.owner_id) != str(owner_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to perform this action.",
            )

        availability.status = request.status
        return self.__repo.save(availability)
