from typing import Mapping, Any
from flask import Flask
from flask_cors import CORS
from prometheus_flask_exporter import PrometheusMetrics

from .config import config_map
from .extensions import db, jwt, migrate


def create_app(config_name: str = "default", config_overrides: Mapping[str, Any] | None = None) -> Flask:
    app = Flask(__name__)
    app.config.from_object(config_map[config_name])
    if config_overrides:
        app.config.update(config_overrides)

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)

    PrometheusMetrics(app, path="/metrics")

    from .routes.auth import auth_bp
    from .routes.daily import daily_bp
    from .routes.todo import todo_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(daily_bp, url_prefix="/api/daily")
    app.register_blueprint(todo_bp, url_prefix="/api/todo")

    _register_cli(app)

    return app


def _register_cli(app: Flask) -> None:
    @app.cli.command("seed-bosses")
    def seed_bosses():
        from .models import Boss

        bosses = [
            Boss(name="Malenia, Blade of Miquella",    required_todos=1, image_path="assets/images/malenia.webp",  audio_path="assets/audio/malenia_theme.mp3",  description="The hardest boss in Elden Ring. Her lifesteal punishes every hit.",  difficulty_order=1),
            Boss(name="Radagon of the Golden Order",   required_todos=2, image_path="assets/images/radagon.webp",  audio_path="assets/audio/radagon_theme.mp3",  description="The secret lord of the Erdtree. Aggressive and relentless.",         difficulty_order=2),
            Boss(name="Mohg, Lord of Blood",           required_todos=3, image_path="assets/images/mohg.webp",     audio_path="assets/audio/mohg_theme.mp3",     description="Patron of the Formless Mother. His Nihil ritual demands sacrifice.", difficulty_order=3),
            Boss(name="Godfrey, the First Elden Lord", required_todos=4, image_path="assets/images/godfrey.webp",  audio_path="assets/audio/godfrey_theme.mp3",  description="The mightiest warrior of the Golden Order.",                         difficulty_order=4),
            Boss(name="Starscourge Radahn",            required_todos=5, image_path="assets/images/radahn.webp",   audio_path="assets/audio/radahn_theme.mp3",   description="Conqueror of the Stars. Only five tasks slow his charge.",           difficulty_order=5),
            Boss(name="Morgott, the Omen King",        required_todos=6, image_path="assets/images/morgott.webp",  audio_path="assets/audio/morgott_theme.mp3",  description="The veiled protector of Leyndell.",                                  difficulty_order=6),
            Boss(name="Messmer the Impaler",           required_todos=7, image_path="assets/images/messmer.webp",  audio_path="assets/audio/messmer_theme.mp3",  description="The shadow of the Erdtree, wielding serpent flame.",                 difficulty_order=7),
        ]
        for boss in bosses:
            if not Boss.query.filter_by(name=boss.name).first():
                db.session.add(boss)
        db.session.commit()
        print("Bosses seeded.")
