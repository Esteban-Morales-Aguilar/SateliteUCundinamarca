from datetime import UTC, datetime

from pydantic import BaseModel, Field


class TelemetryIn(BaseModel):
    time: datetime = Field(default_factory=lambda: datetime.now(UTC))
    mission_id: str = Field("ESTRATOSAT-TELCO-01", max_length=64)
    altitude: float | None = Field(None, ge=-500, le=120_000)
    temperature: float | None = Field(None, ge=-120, le=90)
    pressure: float | None = Field(None, ge=0, le=1100)
    humidity: float | None = Field(None, ge=0, le=100)
    latitude: float | None = Field(None, ge=-90, le=90)
    longitude: float | None = Field(None, ge=-180, le=180)
    rssi: float | None = Field(None, ge=-160, le=0)
    snr: float | None = Field(None, ge=-30, le=30)
    pdr: float | None = Field(None, ge=0, le=1)
    source: str | None = Field("pi", pattern="^(simulator|pi|lora)$")
    cpu_temp: float | None = Field(None, ge=-120, le=150)
    wifi_rssi: float | None = Field(None, ge=-160, le=0)
    cpu_usage: float | None = Field(None, ge=0, le=100)
    memory_usage: float | None = Field(None, ge=0, le=100)


class TelemetryOut(TelemetryIn):
    pass


class MissionOut(BaseModel):
    id: str
    name: str
    description: str | None = None
    status: str
    start_at: datetime
    end_at: datetime | None = None
