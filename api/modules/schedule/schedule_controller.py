from fastapi import APIRouter, Depends, Security
from fastapi_jwt import JwtAuthorizationCredentials
from sqlalchemy.orm import Session

from api.modules.db.db import get_db
from api.modules.schedule.request.schedule_create_request import ScheduleCreateRequest
from api.modules.schedule.schedule_model import Schedule
from api.modules.schedule.schedule_service import ScheduleService
from api.modules.security.security_service import SecurityService


def get_schedule_service(db: Session = Depends(get_db)):
    return ScheduleService(db)


def get_security_service():
    return SecurityService()


router = APIRouter(
    prefix="/schedule",
    tags=["schedule"],
)


@router.post("")
async def schedule(
    data: ScheduleCreateRequest,
    service: ScheduleService = Depends(get_schedule_service),
    credentials: JwtAuthorizationCredentials = Security(
        get_security_service().access_security
    ),
):
    new_schedule: Schedule = service.create_schedule(data, credentials.subject)

    return {"schedule_id": new_schedule.id}
