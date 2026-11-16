from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str | None = None
    rabbitmq_url: str | None = None
    telemetry_api_key: str = ""
    telemetry_demo: bool = True
    cors_origin: str = "*"
    default_mission_id: str = "ESTRATOSAT-TELCO-01"
    simulator_mission_id: str = "ESTRATOSAT-SIM-01"


settings = Settings()
