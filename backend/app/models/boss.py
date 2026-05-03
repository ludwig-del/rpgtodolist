from ..extensions import db


class Boss(db.Model):
    __tablename__ = "bosses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)
    required_todos = db.Column(db.Integer, nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    audio_path = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    difficulty_order = db.Column(db.Integer, nullable=False)

    sessions = db.relationship("DailySession", backref="boss", lazy=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "name": self.name,
            "required_todos": self.required_todos,
            "image_path": self.image_path,
            "audio_path": self.audio_path,
            "description": self.description,
            "difficulty_order": self.difficulty_order,
        }
