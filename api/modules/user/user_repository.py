from sqlalchemy.orm import Session
from api.modules.user.user_model import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, id):
        return self.db.query(User).filter(User.id == id).first()

    def find_all(self):
        return self.db.query(User).all()

    def find_by_email(self, email):
        return self.db.query(User).filter(User.email == email).first()

    def save(self, user):
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
