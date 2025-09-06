from datetime import datetime, timedelta
from typing import Type
from uuid import UUID

from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload

from api.enum.time_enum import TimeEnum
from api.modules.availabilities.availabilities_model import Availabilities
from api.modules.schedule.schedule_model import Schedule


class ScheduleRepository:
    def __init__(self, db: Session):
        self.__db = db

    def find_by_id(self, av_id) -> Schedule | None:
        return self.__db.query(Schedule).filter(Schedule.id == av_id).first()

    def find_all(self) -> list[Type[Schedule]]:
        return self.__db.query(Schedule).all()

    def save(self, schedule) -> Schedule:
        self.__db.add(schedule)
        self.__db.commit()
        self.__db.refresh(schedule)
        return schedule

    def delete(self, schedule):
        self.__db.delete(schedule)
        self.__db.commit()


    def find_by_professional_id_or_patient_id_filter_by_time(
        self, professional_id: UUID, patient_id: UUID, time_filter: TimeEnum
    ) -> list[Schedule]:
        query = (
            self.__db.query(Schedule)
            .join(Schedule.availability)
            .options(joinedload(Schedule.availability))
            .filter(
                or_(
                    Schedule.professional_id == professional_id,
                    Schedule.patient_id == patient_id,
                )
            )
        )

        now = datetime.now()

        match time_filter:
            case TimeEnum.DAY:
                start = datetime(now.year, now.month, now.day)
                end = start + timedelta(days=1)
                query = query.filter(
                    Availabilities.start_time >= start, Availabilities.start_time < end
                )

            case TimeEnum.WEEK:
                start = now - timedelta(days=now.weekday())
                start = datetime(start.year, start.month, start.day)
                end = start + timedelta(days=7)
                query = query.filter(
                    Availabilities.start_time >= start, Availabilities.start_time < end
                )

            case TimeEnum.MONTH:
                start = datetime(now.year, now.month, 1)
                if now.month == 12:
                    end = datetime(now.year + 1, 1, 1)
                else:
                    end = datetime(now.year, now.month + 1, 1)
                query = query.filter(
                    Availabilities.start_time >= start, Availabilities.start_time < end
                )

            case _:
                pass

        return query.all()
