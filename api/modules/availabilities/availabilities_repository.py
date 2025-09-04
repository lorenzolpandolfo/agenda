from datetime import datetime, timedelta
from typing import Type
from uuid import UUID

from sqlalchemy import and_, exists, or_
from sqlalchemy.orm import Session

from api.enum.availability_status_enum import AvailabilityStatusEnum
from api.enum.time_enum import TimeEnum
from api.modules.availabilities.availabilities_model import Availabilities

MAX_MONTHS_YEAR = 12
MAX_DAYS_WEEK = 7


class AvailabilitiesRepository:
    def __init__(self, db: Session):
        self.__db = db

    def find_by_id(self, av_id) -> Availabilities | None:
        return (
            self.__db.query(Availabilities).filter(Availabilities.id == av_id).first()
        )

    def find_all(self) -> list[Type[Availabilities]]:
        return self.__db.query(Availabilities).all()

    def find_all_by_owner_id_status_and_time(
        self,
        owner_id: UUID | None,
        availability_status: AvailabilityStatusEnum,
        time_filter: TimeEnum,
        skip: int = 0,
        limit: int = 10,
    ) -> list[Availabilities]:
        query = self.__db.query(Availabilities)

        if owner_id:
            query = query.filter(Availabilities.owner_id == owner_id)

        now = datetime.now()

        match time_filter:
            case TimeEnum.DAY:
                start = datetime(now.year, now.month, now.day)
                end = start + timedelta(days=1)
            case TimeEnum.WEEK:
                start = now - timedelta(days=now.weekday())
                start = datetime(start.year, start.month, start.day)
                end = start + timedelta(days=MAX_DAYS_WEEK)
            case TimeEnum.MONTH:
                start = datetime(now.year, now.month, 1)
                if now.month == MAX_MONTHS_YEAR:
                    end = datetime(now.year + 1, 1, 1)
                else:
                    end = datetime(now.year, now.month + 1, 1)
            case _:
                start, end = None, None

        if start and end:
            query = query.filter(
                Availabilities.start_time >= start,
                Availabilities.start_time < end,
            )

        query = query.filter(Availabilities.status == availability_status)

        return query.offset(skip).limit(limit).all()

    def save(self, availability) -> Availabilities:
        self.__db.add(availability)
        self.__db.commit()
        self.__db.refresh(availability)
        return availability

    def exists_or_overlap(self, start_time, end_time, owner_id) -> bool:
        return self.__db.query(
            exists().where(
                and_(
                    Availabilities.owner_id == owner_id,
                    or_(
                        and_(
                            Availabilities.start_time == start_time,
                            Availabilities.end_time == end_time,
                        ),
                        and_(
                            Availabilities.start_time < end_time,
                            Availabilities.end_time > start_time,
                        ),
                    ),
                )
            )
        ).scalar()
