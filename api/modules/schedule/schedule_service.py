from typing import Any, Dict
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from starlette import status

from api.enum.availability_status_enum import AvailabilityStatusEnum
from api.enum.time_enum import TimeEnum
from api.modules.availabilities.availabilities_model import Availabilities
from api.modules.availabilities.availabilities_repository import (
    AvailabilitiesRepository,
)
from api.modules.availabilities.availabilities_validator import AvailabilitiesValidator
from api.modules.schedule.request.schedule_create_request import ScheduleCreateRequest
from api.modules.schedule.schedule_mapper import ScheduleMapper
from api.modules.schedule.schedule_model import Schedule
from api.modules.schedule.schedule_repository import ScheduleRepository
from api.modules.schedule.schedule_validator import ScheduleValidator
from api.modules.user.user_model import User
from api.modules.user.user_repository import UserRepository
from api.modules.user.user_validator import UserValidator


class ScheduleService:
    def __init__(self, db: Session):
        self.__repo: ScheduleRepository = ScheduleRepository(db)
        self.__availabilities_repo: AvailabilitiesRepository = AvailabilitiesRepository(
            db
        )
        self.__user_repo: UserRepository = UserRepository(db)

    def create_schedule(
        self, request: ScheduleCreateRequest, subject: Dict[str, Any]
    ) -> Schedule | None:
        availability: Availabilities = self.__availabilities_repo.find_by_id(
            request.availability_id
        )
        user: User = self.__user_repo.find_by_id(subject.get("user_id"))

        AvailabilitiesValidator.validate_if_can_schedule(availability, user)

        schedule: Schedule = ScheduleMapper.to_schedule(
            professional_id=availability.owner_id,
            patient_id=user.id,
            availability_id=availability.id,
        )

        try:
            schedule: Schedule = self.__repo.save(schedule)
            self.__update_availability_to_taken(availability)
            return schedule

        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="This schedule already exists",
            )

    def __update_availability_to_taken(self, availability: Availabilities):
        availability.status = AvailabilityStatusEnum.TAKEN
        self.__availabilities_repo.save(availability)

    def get_schedules(self, time_filter: TimeEnum, subject: Dict[str, Any]):
        user: User = self.__user_repo.find_by_id(subject.get("user_id"))

        schedule_list: list[Schedule] = (
            self.__repo.find_by_professional_id_or_patient_id_filter_by_time(
                user.id, user.id, time_filter
            )
        )

        return [ScheduleMapper.to_schedule_response(s) for s in schedule_list]

    def delete_schedule(self, schedule_id: UUID, user_id: UUID):
        schedule: Schedule = self.__repo.find_by_id(schedule_id)
        user: User = self.__user_repo.find_by_id(user_id)
        availability: Availabilities = schedule.availability

        UserValidator.validate_user(user)
        ScheduleValidator.validate_schedule(schedule)
        ScheduleValidator.validate_delete_schedule(schedule, user)
        AvailabilitiesValidator.validate_availability(availability)

        if availability.status == AvailabilityStatusEnum.TAKEN:
            availability.status = AvailabilityStatusEnum.AVAILABLE
            self.__availabilities_repo.save(availability)

        self.__repo.delete(schedule)
