from pydantic import BaseModel, field_validator

MIN_SIZE_PASSWORD = 6
MIN_SIZE_EMAIL = 3

class UserRequestRegister(BaseModel):
    email: str
    password: str
    name: str
    crp: str | None = None
    phone: str | None = None
    bio: str | None = None
    image_url: str | None = None


    @field_validator("password")
    def validate_password_length(cls, pwd: str):
        if len(pwd) < MIN_SIZE_PASSWORD:
            raise ValueError(f"Password must be at least {MIN_SIZE_PASSWORD} characters")
        return pwd

    @field_validator("email")
    def validate_email(cls, email: str):
        if len(email) < MIN_SIZE_EMAIL:
            raise ValueError(f"Email must be at least {MIN_SIZE_EMAIL} characters")

        if email.count("@") != 1:
            raise ValueError("Invalid email address")

        return email

