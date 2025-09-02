from datetime import timedelta
from fastapi_jwt import (
    JwtAuthorizationCredentials,
    JwtAccessBearerCookie,
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
            secret_key="secret_key", auto_error=True
        )

    def auth(self, subject):
        # após validar email e senha em user_service, o subject vai conter o id do usuário no banco
        access_token = self.access_security.create_access_token(subject=subject)
        refresh_token = self.refresh_security.create_refresh_token(subject=subject)
        return {"access_token": access_token, "refresh_token": refresh_token}

    def refresh(self, credentials: JwtAuthorizationCredentials):
        access_token = self.access_security.create_access_token(
            subject=credentials.subject
        )
        refresh_token = self.refresh_security.create_refresh_token(
            subject=credentials.subject
        )
        return {"access_token": access_token, "refresh_token": refresh_token}
