from sqlalchemy.orm import Session
from api.modules.psychologist.psychologist_model import Psychologist

class PsychologistRepository:
    def __init__(self, db: Session):
        self.db = db

    def find_by_id(self, id):
        return self.db.query(Psychologist).filter(Psychologist.id == id).first()

    def find_all(self):
        return self.db.query(Psychologist).all()
