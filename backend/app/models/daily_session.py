from datetime import date, datetime, timezone

from ..extensions import db


class DailySession(db.Model):
    __tablename__ = "daily_sessions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    boss_id = db.Column(db.Integer, db.ForeignKey("bosses.id"), nullable=False)
    session_date = db.Column(db.Date, nullable=False, default=date.today)
    required_todos = db.Column(db.Integer, nullable=False)
    current_todos_done = db.Column(db.Integer, nullable=False, default=0)
    is_cleared = db.Column(db.Boolean, nullable=False, default=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    cleared_at = db.Column(db.DateTime(timezone=True), nullable=True)

    __table_args__ = (
        db.UniqueConstraint("user_id", "session_date", name="uq_user_daily_session"),
        db.CheckConstraint("current_todos_done >= 0", name="chk_todos_non_negative"),
        db.CheckConstraint("current_todos_done <= required_todos", name="chk_todos_not_exceed"),
    )

    todos = db.relationship(
        "Todo", backref="session", lazy=True, cascade="all, delete-orphan"
    )

    @property
    def hp_percentage(self) -> float:
        if self.required_todos == 0:
            return 0.0
        remaining = self.required_todos - self.current_todos_done
        return max(0.0, (remaining / self.required_todos) * 100)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "boss_id": self.boss_id,
            "boss": self.boss.to_dict() if self.boss else None,
            "session_date": self.session_date.isoformat(),
            "required_todos": self.required_todos,
            "current_todos_done": self.current_todos_done,
            "is_cleared": self.is_cleared,
            "hp_percentage": self.hp_percentage,
            "created_at": self.created_at.isoformat(),
            "cleared_at": self.cleared_at.isoformat() if self.cleared_at else None,
        }
