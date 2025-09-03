from api.enum.serializable_enum import SerializableEnum


class UserStatusEnum(SerializableEnum):
    READY = "READY"
    WAITING_VALIDATION = "WAITING_VALIDATION"
