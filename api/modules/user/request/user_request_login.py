from pydantic import BaseModel

class UserRequestLogin(BaseModel):
    email: str
    password: str
