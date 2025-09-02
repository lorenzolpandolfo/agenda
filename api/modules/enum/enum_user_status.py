from enum import Enum


class UserStatus(Enum):
    READY = 0
    WAITING_VALIDATION = 1

    def __str__(self) -> str:
        return self.name
