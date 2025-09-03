from sqlalchemy.orm import Session
from api.modules.user.user_model import User


class UserRepository:
    def __init__(self, db: Session):
        self.__db = db

    def find_by_id(self, user_id):
        return self.__db.query(User).filter(User.id == user_id).first()

    def find_all(self):
        return self.__db.query(User).all()

    def find_by_email(self, email):
        return self.__db.query(User).filter(User.email == email).first()

    def save(self, user):
        self.__db.add(user)
        self.__db.commit()
        self.__db.refresh(user)
        return user
