from api.enum.serializable_enum import SerializableEnum


class TimeEnum(SerializableEnum):
    DAY = "DAY"
    WEEK = "WEEK"
    MONTH = "MONTH"
    ALL = "ALL"
