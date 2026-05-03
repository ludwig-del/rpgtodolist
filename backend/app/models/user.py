from datetime import datetime, timezone
from ..extensions import db


class User(db.Model):
    __tablename__ = "users"

    id        = db.Column(db.Integer, primary_key=True)
    device_id = db.Column(db.String(36), unique=True, nullable=False)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    sessions = db.relationship("DailySession", backref="user", lazy=True)

    def to_dict(self):
        return {"id": self.id, "device_id": self.device_id}
