from sqlalchemy import Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True
    )

    display_name: Mapped[str | None] = mapped_column(Text)

    avatar_url: Mapped[str | None] = mapped_column(Text)

    level: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )