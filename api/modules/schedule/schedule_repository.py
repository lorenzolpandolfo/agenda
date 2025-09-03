from typing import Type

from sqlalchemy.orm import Session
from api.modules.schedule.schedule_model import Schedule


class ScheduleRepository:
    def __init__(self, db: Session):
        self.__db = db

    def find_by_id(self, av_id) -> Schedule | None:
        return self.__db.query(Schedule).filter(Schedule.id == av_id).first()

    def find_all(self) -> list[Type[Schedule]]:
        return self.__db.query(Schedule).all()

    def save(self, availability) -> Schedule:
        self.__db.add(availability)
        self.__db.commit()
        self.__db.refresh(availability)
        return availability
