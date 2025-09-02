from enum import Enum

class AvailabilityStatus(Enum):
    AVAILABLE = "AVAILABLE"
    TAKEN = "TAKEN"
    COMPLETED = "COMPLETED"
    CANCELED = "CANCELED"