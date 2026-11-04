"""
AURA Weather Pydantic Schemas
Strictly matching 04_API.txt section D and 08_SCHEMA.txt.
"""

from pydantic import BaseModel, Field, ConfigDict


class WeatherOut(BaseModel):
    city: str
    temp_c: float
    feels_like_c: float
    condition: str
    rain_probability: int
    weather_class: str = Field(..., alias="class", serialization_alias="class")
    is_rainy: bool

    model_config = ConfigDict(populate_by_name=True)
