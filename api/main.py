from fastapi import FastAPI

from api.modules.availabilities.availabilities_controller import (
    router as availabilities_router,
)
from api.modules.schedule.schedule_controller import router as schedule_router
from api.modules.security.security_controller import router as security_router
from api.modules.user.user_controller import router as user_router

app = FastAPI()

app.include_router(security_router)
app.include_router(user_router)
app.include_router(availabilities_router)
app.include_router(schedule_router)
