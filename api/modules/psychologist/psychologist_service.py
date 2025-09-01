from sqlalchemy.orm import Session
from api.modules.psychologist.psychologist_repository import PsychologistRepository

class PsychologistService:
    def __init__(self, db: Session):
        self.repo = PsychologistRepository(db)

    def get_psychologist(self, id):
        return self.repo.find_all()
