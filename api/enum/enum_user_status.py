from api.enum.serializable_enum import SerializableEnum


class UserStatus(SerializableEnum):
    READY = "READY"
    WAITING_VALIDATION = "WAITING_VALIDATION"
