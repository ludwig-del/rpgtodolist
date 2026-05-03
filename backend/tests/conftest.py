import pytest
from app import create_app
from app.extensions import db as _db
from app.models import Boss, User


@pytest.fixture(scope="session")
def app():
    test_app = create_app("development")
    test_app.config.update(
        TESTING=True,
        SQLALCHEMY_DATABASE_URI="sqlite:///:memory:",
        JWT_SECRET_KEY="test-secret",
    )
    with test_app.app_context():
        _db.create_all()
        _seed_bosses()
        yield test_app
        _db.drop_all()


def _seed_bosses():
    bosses = [
        Boss(name="Malenia, Blade of Miquella",    required_todos=1, image_path="x", audio_path="x", difficulty_order=1),
        Boss(name="Radagon of the Golden Order",   required_todos=2, image_path="x", audio_path="x", difficulty_order=2),
        Boss(name="Mohg, Lord of Blood",           required_todos=3, image_path="x", audio_path="x", difficulty_order=3),
        Boss(name="Godfrey, the First Elden Lord", required_todos=4, image_path="x", audio_path="x", difficulty_order=4),
        Boss(name="Starscourge Radahn",            required_todos=5, image_path="x", audio_path="x", difficulty_order=5),
        Boss(name="Morgott, the Omen King",        required_todos=6, image_path="x", audio_path="x", difficulty_order=6),
        Boss(name="Messmer the Impaler",           required_todos=7, image_path="x", audio_path="x", difficulty_order=7),
    ]
    _db.session.add_all(bosses)
    _db.session.commit()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(client):
    client.post("/api/auth/register", json={
        "username": "tarnished",
        "email": "tarnished@test.com",
        "password": "password123",
    })
    resp = client.post("/api/auth/login", json={
        "email": "tarnished@test.com",
        "password": "password123",
    })
    token = resp.get_json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
