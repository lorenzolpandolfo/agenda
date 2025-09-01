from sqlalchemy.orm import Session
from api.modules.user.request.user_request_login import UserRequestLogin
from api.modules.user.user_repository import UserRepository
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def get_all_users(self):
        return self.repo.find_all()

    def login(self, data: UserRequestLogin):
        user = self.repo.find_by_email(data.email)

        if not user:
            return None

        if not pwd_context.verify(data.password, user.password_hash):
            return None

        return user