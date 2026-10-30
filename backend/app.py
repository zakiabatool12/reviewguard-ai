from flask import Flask, request, jsonify
from flask_cors import CORS

from config import Config
from services.prediction_service import prediction_service
from services.explanation_service import get_signals

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, origins=[Config.FRONTEND_ORIGIN])


def error(message, status=400):
    return jsonify({"error": message}), status


@app.get("/api/health")
def health():
    return jsonify({"status": "ok"})


@app.post("/api/analyze")
def analyze():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON.")

    review = data.get("review")
    rating = data.get("rating")

    # --- validation ---
    if not isinstance(review, str):
        return error("Review must be text.")
    review = review.strip()
    if not review:
        return error("Review cannot be empty.")
    if len(review) > Config.MAX_REVIEW_LENGTH:
        return error(f"Review is too long (max {Config.MAX_REVIEW_LENGTH} characters).")

    if rating is not None:
        # bool bhi int hota hai Python mein, isliye alag check
        if isinstance(rating, bool) or not isinstance(rating, int) or not 1 <= rating <= 5:
            return error("Rating must be a whole number from 1 to 5.")

    # --- prediction ---
    try:
        result = prediction_service.predict(review)
    except Exception:
        app.logger.exception("Prediction failed")
        return error("Could not analyze the review right now.", 500)

    return jsonify({
        **result,
        "signals": get_signals(review, rating),
        "message": "Review analyzed successfully",
    })


@app.errorhandler(404)
def not_found(_):
    return error("Route not found.", 404)

@app.errorhandler(413)
def too_large(_):
    return error("Request is too large.", 413)

@app.errorhandler(500)
def server_error(_):
    return error("Internal server error.", 500)


if __name__ == "__main__":
    app.run(port=5000, debug=Config.DEBUG)