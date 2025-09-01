from sqlalchemy import Column, String, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
import uuid
from api.modules.db.db import Base

class Psychologist(Base):
    __tablename__ = "psychologists"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, nullable=False)
    email = Column(String, nullable=False, unique=True)
    crp = Column(String, nullable=False, unique=True)
    created_at = Column(TIMESTAMP)
