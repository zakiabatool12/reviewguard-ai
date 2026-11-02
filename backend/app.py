from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

from config import Config
from routes.auth import auth_bp
from routes.analysis import analysis_bp

try:
    from routes.profile import profile_bp
except ImportError:  # profile routes not installed yet
    profile_bp = None

# Refuse to start with a weak or placeholder secret
_secret = Config.JWT_SECRET_KEY or ""
if len(_secret) < 32 or _secret.startswith("change-this"):
    raise RuntimeError(
        "JWT_SECRET_KEY in backend/.env is missing, too short or still a placeholder. "
        "Generate one with: python -c \"import secrets; print(secrets.token_urlsafe(48))\""
    )

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=[Config.FRONTEND_ORIGIN], supports_credentials=True)

jwt = JWTManager(app)
limiter = Limiter(get_remote_address, app=app, default_limits=["300 per hour"])

app.register_blueprint(auth_bp)
app.register_blueprint(analysis_bp)
if profile_bp is not None:
    app.register_blueprint(profile_bp)


def limit(endpoint, rule):
    """Apply a rate limit to an already-registered route."""
    if endpoint in app.view_functions:
        app.view_functions[endpoint] = limiter.limit(rule)(app.view_functions[endpoint])


limit("auth.register", "10 per hour")
limit("auth.login", "10 per minute")
limit("auth.verify_otp", "10 per minute")
limit("auth.resend_otp", "5 per hour")
limit("analysis.analyze", "60 per minute")
limit("profile.change_password", "5 per hour")


def error(message, status=400):
    return jsonify({"error": message}), status


@jwt.unauthorized_loader
def missing_token(_msg):
    return error("Please log in first.", 401)


@jwt.invalid_token_loader
def invalid_token(_msg):
    return error("Invalid session. Please log in again.", 401)


@jwt.expired_token_loader
def expired_token(_header, _payload):
    return error("Session expired. Please log in again.", 401)


@app.after_request
def security_headers(resp):
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer"
    resp.headers["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'"
    if request.path.startswith("/api/"):
        resp.headers["Cache-Control"] = "no-store"
    return resp


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.errorhandler(404)
def not_found(_):
    return error("Route not found.", 404)


@app.errorhandler(413)
def too_large(_):
    return error("Request is too large.", 413)


@app.errorhandler(429)
def too_many(_):
    return error("Too many requests. Please slow down and try again later.", 429)


@app.errorhandler(500)
def server_error(_):
    return error("Internal server error.", 500)


if __name__ == "__main__":
    app.run(port=5000, debug=Config.DEBUG)