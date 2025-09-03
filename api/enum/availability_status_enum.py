from enum import Enum


class AvailabilityStatusEnum(Enum):
    AVAILABLE = "AVAILABLE"
    TAKEN = "TAKEN"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"
