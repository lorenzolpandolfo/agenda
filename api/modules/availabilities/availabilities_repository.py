from typing import Type

from sqlalchemy import and_, exists, or_
from sqlalchemy.orm import Session
from api.modules.availabilities.availabilities_model import Availabilities


class AvailabilitiesRepository:
    def __init__(self, db: Session):
        self.__db = db

    def find_by_id(self, av_id) -> Availabilities | None:
        return self.__db.query(Availabilities).filter(Availabilities.id == av_id).first()

    def find_all(self) -> list[Type[Availabilities]]:
        return self.__db.query(Availabilities).all()

    def find_by_owner_id(self, owner_id) -> Availabilities | None:
        return self.__db.query(Availabilities).filter(Availabilities.owner_id == owner_id).first()

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
                        )
                    )
                )
            )
        ).scalar()
