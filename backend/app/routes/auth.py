from flask import Blueprint, jsonify

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
def register():
    return jsonify({
        "error": "Authentication is disabled. Use X-Device-ID for user identification.",
    }), 410


@auth_bp.route("/login", methods=["POST"])
def login():
    return jsonify({
        "error": "Authentication is disabled. Use X-Device-ID for user identification.",
    }), 410


@auth_bp.route("/me", methods=["GET"])
def me():
    return jsonify({
        "error": "Authentication is disabled. Use X-Device-ID for user identification.",
    }), 410
