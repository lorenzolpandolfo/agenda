from enum import Enum


class SerializableEnum(Enum):

    def __str__(self) -> str:
        return self.name
