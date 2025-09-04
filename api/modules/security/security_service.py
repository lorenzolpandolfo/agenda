from datetime import timedelta

from fastapi_jwt import (
    JwtAccessBearerCookie,
    JwtAuthorizationCredentials,
    JwtRefreshBearer,
)

ACCESS_TOKEN_EXPIRE_HOURS = 1
REFRESH_TOKEN_EXPIRE_DAYS = 2


class SecurityService:
    def __init__(self):
        self.access_security = JwtAccessBearerCookie(
            secret_key="secret_key",
            auto_error=True,
            access_expires_delta=timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS),
        )
        self.refresh_security = JwtRefreshBearer(
            secret_key="secret_key",
            auto_error=True,
            access_expires_delta=timedelta(hours=REFRESH_TOKEN_EXPIRE_DAYS),
        )

    def auth(self, sub):
        access_token = self.access_security.create_access_token(subject=sub)
        refresh_token = self.refresh_security.create_refresh_token(subject=sub)
        return {"access_token": access_token, "refresh_token": refresh_token}

    def refresh(self, credentials: JwtAuthorizationCredentials):
        access_token = self.access_security.create_access_token(
            subject=credentials.subject
        )
        refresh_token = self.refresh_security.create_refresh_token(
            subject=credentials.subject
        )
        return {"access_token": access_token, "refresh_token": refresh_token}
