from pydantic import BaseModel, field_validator

MIN_SIZE_PASSWORD = 6


class UserUpdateRequest(BaseModel):
    name: str | None = None
    bio: str | None = None
    password: str | None = None
    image_url: str | None = None

    @field_validator("password")
    def validate_password_length(cls, pwd: str | None):
        if pwd is None:
            return pwd
        if len(pwd) < MIN_SIZE_PASSWORD:
            raise ValueError(
                f"Password must be at least {MIN_SIZE_PASSWORD} characters"
            )
        return pwd
