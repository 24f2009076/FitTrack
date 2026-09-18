from sqlalchemy import ForeignKey, Numeric, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base

class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True
    )

    username: Mapped[str | None] = mapped_column(
        Text,
        unique=True,
        nullable=True
    )

    profile_pic_url: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    
    level: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )
    
    goal: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )
    
    height_cm: Mapped[float | None] = mapped_column(
        Numeric,
        nullable=True
    )
    
    weight_kg: Mapped[float | None] = mapped_column(
        Numeric,
        nullable=True
    )