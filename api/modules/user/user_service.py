from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from api.modules.enum.enum_user_roles import UserRoles
from api.modules.enum.enum_user_status import UserStatus
from api.modules.user.request.user_login_request import UserLoginRequest
from api.modules.user.request.user_register_request import UserRegisterRequest
from api.modules.user.user_model import User
from api.modules.user.user_repository import UserRepository
from passlib.context import CryptContext

from api.modules.user.user_validator import UserValidator

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


class UserService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def get_user_data(self, user_id, credentials_subject):
        if not user_id:
            current_user_data = credentials_subject.get("user_data")
            return User(
                id=current_user_data.get("user_id"),
                name=current_user_data.get("name"),
                email=current_user_data.get("email"),
                role=current_user_data.get("role"),
                status=current_user_data.get("status"),
                crp=current_user_data.get("crp"),
                phone=current_user_data.get("phone"),
                bio=current_user_data.get("bio"),
                image_url=current_user_data.get("image_url"),
                created_at=current_user_data.get("created_at"),
            )
        return self.repo.find_by_id(user_id)

    def login(self, data: UserLoginRequest) -> User | None:
        user = self.repo.find_by_email(data.email)

        if not user or not pwd_context.verify(data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email or password",
            )

        return user

    def register(self, data: UserRegisterRequest) -> User:
        user = User(
            email=data.email,
            password_hash=hash_password(data.password),
            name=data.name,
            role=UserRoles.PROFESSIONAL if data.crp else UserRoles.PATIENT,
            status=(UserStatus.WAITING_VALIDATION if data.crp else UserStatus.READY),
            crp=data.crp if data.crp else None,
            phone=data.phone if data.phone else None,
            bio=data.bio if data.bio else None,
            image_url=data.image_url if data.image_url else None,
        )

        try:
            return self.repo.save(user)

        except IntegrityError:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email or CRP already registered",
            )

    def verify_crp(self, user_id_to_verify, current_user_id):
        if not user_id_to_verify:
            user_id_to_verify = current_user_id

        user_to_verify: User = self.repo.find_by_id(user_id_to_verify)

        UserValidator.validate_user(user_to_verify)
        UserValidator.validate_user_professional(user_to_verify)

        user_to_verify.status = str(UserStatus.READY)

        return self.repo.save(user_to_verify)
