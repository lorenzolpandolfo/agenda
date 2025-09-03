from datetime import datetime, timedelta
from typing import Type
from uuid import UUID

from sqlalchemy import and_, exists, or_
from sqlalchemy.orm import Session

from api.enum.time_enum import TimeEnum
from api.modules.availabilities.availabilities_model import Availabilities


class AvailabilitiesRepository:
    def __init__(self, db: Session):
        self.__db = db

    def find_by_id(self, av_id) -> Availabilities | None:
        return (
            self.__db.query(Availabilities).filter(Availabilities.id == av_id).first()
        )

    def find_all(self) -> list[Type[Availabilities]]:
        return self.__db.query(Availabilities).all()

    def find_all_by_owner_id_and_time(
        self, owner_id: UUID, time_filter: TimeEnum
    ) -> list[Availabilities] | None:
        query = self.__db.query(Availabilities).filter(
            Availabilities.owner_id == owner_id
        )

        now = datetime.now()

        match time_filter:
            case TimeEnum.DAY:
                start = datetime(now.year, now.month, now.day)
                end = start + timedelta(days=1)
            case TimeEnum.WEEK:
                start = now - timedelta(days=now.weekday())
                start = datetime(start.year, start.month, start.day)
                end = start + timedelta(days=7)
            case TimeEnum.MONTH:
                start = datetime(now.year, now.month, 1)
                if now.month == 12:
                    end = datetime(now.year + 1, 1, 1)
                else:
                    end = datetime(now.year, now.month + 1, 1)
            case _:
                start, end = None, None

        if start and end:
            query = query.filter(
                Availabilities.start_time >= start, Availabilities.start_time < end
            )

        return query.all()

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
