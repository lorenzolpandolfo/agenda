from fastapi import HTTPException
from sqlalchemy.orm import Session
from starlette import status

from api.modules.availabilities.availabilities_model import Availabilities
from api.modules.availabilities.availabilities_repository import AvailabilitiesRepository
from api.modules.availabilities.request.availabilities_request_create import AvailabilitiesRequestCreate
from api.modules.user.user_repository import UserRepository
from api.modules.user.user_model import User
from api.modules.enum.enum_user_roles import UserRoles

class AvailabilitiesService:

    def __init__(self, db: Session):
        self.repo: AvailabilitiesRepository = AvailabilitiesRepository(db)
        self.user_repo: UserRepository = UserRepository(db)


    def create_availability(self, request: AvailabilitiesRequestCreate, owner_id):
        owner_user: User = self.user_repo.find_by_id(owner_id)

        if owner_user.role != str(UserRoles.PROFESSIONAL):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not authorized to perform this action.")

        if self.repo.exists_or_overlap(request.start_time, request.end_time, owner_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="start_time and end_time are conflicting with another availability for this user."
            )

        availability = Availabilities(
            start_time=request.start_time,
            end_time=request.end_time,
            owner_id=owner_id,
        )

        return self.repo.save(availability)
