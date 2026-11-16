from datetime import datetime
from pydantic import BaseModel


class Mission(BaseModel):
    id: str
    name: str
    description: str | None = None
    start_at: datetime | None = None
    end_at: datetime | None = None
    status: str = "planned"
