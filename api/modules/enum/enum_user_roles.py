from enum import Enum


class UserRoles(Enum):
    PATIENT = 0
    PROFESSIONAL = 1

    def __str__(self) -> str:
        return self.name
