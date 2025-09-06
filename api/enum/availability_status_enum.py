from api.enum.serializable_enum import SerializableEnum


class AvailabilityStatusEnum(SerializableEnum):
    AVAILABLE = "AVAILABLE"
    TAKEN = "TAKEN"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"
