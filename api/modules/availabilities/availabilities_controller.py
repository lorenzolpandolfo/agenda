from typing import List
from uuid import UUID

from fastapi import HTTPException, Security, status, APIRouter, Depends
from fastapi_jwt import JwtAuthorizationCredentials
from sqlalchemy.orm import Session

from api.modules.availabilities.availabilities_model import Availabilities
from api.modules.availabilities.availabilities_service import AvailabilitiesService
from api.modules.availabilities.request.availabilities_change_status_request import (
    AvailabilitiesUpdateStatusRequest,
)
from api.modules.availabilities.request.availabilities_create_request import (
    AvailabilitiesCreateRequest,
)
from api.modules.db.db import get_db
from api.modules.security.security_service import SecurityService
from api.modules.user.user_controller import get_user_service


def get_availabilities_service(db: Session = Depends(get_db)):
    return AvailabilitiesService(db)


def get_security_service():
    return SecurityService()


router = APIRouter(
    prefix="/availabilities",
    tags=["availabilities"],
)


@router.post("")
async def availabilities(
    data: AvailabilitiesCreateRequest,
    service: AvailabilitiesService = Depends(get_availabilities_service),
    credentials: JwtAuthorizationCredentials = Security(
        get_security_service().access_security
    ),
):
    availability: Availabilities = service.create_availability(
        data, credentials.subject.get("user_id")
    )

    if not availability:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid request",
        )

    return {"availability_id": availability.id}


@router.get("")
async def availabilities(
    professional_id: UUID,
    service: AvailabilitiesService = Depends(get_availabilities_service),
    credentials: JwtAuthorizationCredentials = Security(
        get_security_service().access_security
    ),
):
    if not professional_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid request"
        )

    availability_list: List[Availabilities] = service.get_availabilities(
        professional_id
    )

    return availability_list


@router.post("/change-status")
async def change_status(
    data: AvailabilitiesUpdateStatusRequest,
    service: AvailabilitiesService = Depends(get_availabilities_service),
    credentials: JwtAuthorizationCredentials = Security(
        get_security_service().access_security
    ),
):
    availability: Availabilities = service.change_status(
        data, credentials.subject.get("user_id")
    )

    return availability
