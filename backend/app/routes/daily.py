from datetime import date

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request

from ..extensions import db
from ..models import Boss, DailySession, User

daily_bp = Blueprint("daily", __name__)


def _get_or_create_user() -> User | None:
    verify_jwt_in_request(optional=True)
    identity = get_jwt_identity()
    if identity is not None:
        return User.query.get(int(identity))

    device_id = request.headers.get("X-Device-ID", "").strip()
    if not device_id:
        return None
    user = User.query.filter_by(device_id=device_id).first()
    if not user:
        user = User(device_id=device_id)
        db.session.add(user)
        db.session.commit()
    return user


@daily_bp.route("/bosses", methods=["GET"])
def get_bosses():
    bosses = Boss.query.order_by(Boss.difficulty_order).all()
    return jsonify([b.to_dict() for b in bosses]), 200


@daily_bp.route("/session", methods=["GET"])
def get_today_session():
    user = _get_or_create_user()
    if not user:
        return jsonify({"session": None}), 200
    session = DailySession.query.filter_by(
        user_id=user.id, session_date=date.today()
    ).first()
    return jsonify({"session": session.to_dict() if session else None}), 200


@daily_bp.route("/select-boss", methods=["POST"])
def select_boss():
    user = _get_or_create_user()
    if not user:
        return jsonify({"error": "X-Device-ID header required"}), 400

    data = request.get_json() or {}
    if "boss_id" not in data:
        return jsonify({"error": "boss_id is required"}), 400

    existing = DailySession.query.filter_by(
        user_id=user.id, session_date=date.today()
    ).first()
    if existing:
        return jsonify({"error": "Boss already selected for today", "session": existing.to_dict()}), 409

    boss = Boss.query.get(data["boss_id"])
    if not boss:
        return jsonify({"error": "Boss not found"}), 404

    session = DailySession(
        user_id=user.id,
        boss_id=boss.id,
        session_date=date.today(),
        required_todos=boss.required_todos,
    )
    db.session.add(session)
    db.session.commit()
    return jsonify({"session": session.to_dict()}), 201


@daily_bp.route("/history", methods=["GET"])
def get_history():
    user = _get_or_create_user()
    if not user:
        return jsonify([]), 200
    sessions = (
        DailySession.query.filter_by(user_id=user.id)
        .order_by(DailySession.session_date.desc())
        .limit(30)
        .all()
    )
    return jsonify([s.to_dict() for s in sessions]), 200
