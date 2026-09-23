from datetime import datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Text,
    func,
    text,
)

from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class CoachConversation(Base):
    __tablename__ = "coach_conversations"

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    user_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey(
            "profiles.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    title: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False
    )

    messages: Mapped[list["CoachMessage"]] = relationship(
        "CoachMessage",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="CoachMessage.created_at"
    )


class CoachMessage(Base):
    __tablename__ = "coach_messages"

    __table_args__ = (
        CheckConstraint(
            "role IN ('user', 'assistant')",
            name="coach_messages_role_valid"
        ),
    )

    id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        primary_key=True,
        server_default=text("gen_random_uuid()")
    )

    conversation_id: Mapped[str] = mapped_column(
        UUID(as_uuid=False),
        ForeignKey(
            "coach_conversations.id",
            ondelete="CASCADE"
        ),
        nullable=False
    )

    role: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    content: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    conversation: Mapped["CoachConversation"] = relationship(
        "CoachConversation",
        back_populates="messages"
    )
    
    
    
    
    
    
    
    
    