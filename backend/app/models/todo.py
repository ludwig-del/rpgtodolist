from datetime import datetime, timezone

from ..extensions import db

_todo_status = db.Enum("pending", "done", name="todo_status")


class Todo(db.Model):
    __tablename__ = "todos"

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(
        db.Integer,
        db.ForeignKey("daily_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    task_name = db.Column(db.String(255), nullable=False)
    status = db.Column(_todo_status, nullable=False, default="pending")
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    completed_at = db.Column(db.DateTime(timezone=True), nullable=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "session_id": self.session_id,
            "task_name": self.task_name,
            "status": self.status,
            "created_at": self.created_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
        }
