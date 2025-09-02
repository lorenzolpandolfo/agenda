from pydantic import BaseModel

class UserRequestRegister(BaseModel):
    email: str
    password: str
    name: str
    crp: str | None = None
    phone: str | None = None
    bio: str | None = None
    image_url: str | None = None
