from datetime import date, datetime, timezone

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request
from sqlalchemy import text

from ..extensions import db
from ..models import DailySession, Todo, User

todo_bp = Blueprint("todo", __name__)


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


def _get_active_session(user: User) -> DailySession | None:
    return DailySession.query.filter_by(
        user_id=user.id, session_date=date.today()
    ).first()


@todo_bp.route("/", methods=["GET"])
def get_todos():
    user = _get_or_create_user()
    if not user:
        return jsonify({"error": "X-Device-ID header required"}), 400
    session = _get_active_session(user)
    if not session:
        return jsonify({"error": "No active session today"}), 404
    return jsonify({"todos": [t.to_dict() for t in session.todos], "session": session.to_dict()}), 200


@todo_bp.route("/", methods=["POST"])
def create_todo():
    user = _get_or_create_user()
    if not user:
        return jsonify({"error": "X-Device-ID header required"}), 400

    data = request.get_json() or {}
    if not data.get("task_name", "").strip():
        return jsonify({"error": "task_name is required"}), 400

    session = _get_active_session(user)
    if not session:
        return jsonify({"error": "No active session today. Select a boss first."}), 404

    todo = Todo(session_id=session.id, task_name=data["task_name"].strip())
    db.session.add(todo)
    db.session.commit()
    return jsonify({"todo": todo.to_dict()}), 201


@todo_bp.route("/tick/<int:todo_id>", methods=["PATCH"])
def tick_todo(todo_id: int):
    user = _get_or_create_user()
    if not user:
        return jsonify({"error": "X-Device-ID header required"}), 400

    session = _get_active_session(user)
    if not session:
        return jsonify({"error": "No active session today"}), 404

    todo = Todo.query.filter_by(id=todo_id, session_id=session.id).first()
    if not todo:
        return jsonify({"error": "Todo not found"}), 404
    if todo.status == "done":
        return jsonify({"error": "Task already completed"}), 409

    now = datetime.now(timezone.utc)
    todo.status = "done"
    todo.completed_at = now

    db.session.execute(
        text("""
            UPDATE daily_sessions
            SET
                current_todos_done = current_todos_done + 1,
                is_cleared = CASE
                    WHEN current_todos_done + 1 >= required_todos THEN TRUE ELSE FALSE
                END,
                cleared_at = CASE
                    WHEN current_todos_done + 1 >= required_todos AND cleared_at IS NULL
                        THEN :now ELSE cleared_at
                END
            WHERE id = :session_id AND is_cleared = FALSE
        """),
        {"session_id": session.id, "now": now},
    )
    db.session.commit()
    db.session.refresh(session)

    return jsonify({
        "todo": todo.to_dict(),
        "session": session.to_dict(),
        "boss_defeated": session.is_cleared,
    }), 200


@todo_bp.route("/<int:todo_id>", methods=["DELETE"])
def delete_todo(todo_id: int):
    user = _get_or_create_user()
    if not user:
        return jsonify({"error": "X-Device-ID header required"}), 400

    session = _get_active_session(user)
    if not session:
        return jsonify({"error": "No active session"}), 404

    todo = Todo.query.filter_by(id=todo_id, session_id=session.id).first()
    if not todo:
        return jsonify({"error": "Todo not found"}), 404
    if todo.status == "done":
        return jsonify({"error": "Cannot delete a completed task"}), 400

    db.session.delete(todo)
    db.session.commit()
    return jsonify({"message": "Task deleted"}), 200
