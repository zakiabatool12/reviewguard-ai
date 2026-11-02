import json
from datetime import datetime, timedelta

import mysql.connector
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    verify_jwt_in_request,
    jwt_required,
    get_jwt_identity,
)

from config import Config
from db import get_connection
from services.prediction_service import prediction_service
from services.explanation_service import get_signals

analysis_bp = Blueprint("analysis", __name__, url_prefix="/api")

LABELS = ("genuine", "suspicious")


def error(message, status=400):
    return jsonify({"error": message}), status


def optional_user_id():
    """Return the logged-in user's id, or None for guests."""
    try:
        verify_jwt_in_request(optional=True)
        ident = get_jwt_identity()
        return int(ident) if ident else None
    except Exception as exc:
        current_app.logger.warning("Not saving analysis: %s", exc)
        return None


def int_arg(name, default, lo, hi):
    try:
        value = int(request.args.get(name, default))
    except (TypeError, ValueError):
        return default
    return max(lo, min(hi, value))


def date_arg(name):
    raw = request.args.get(name, "").strip()
    if not raw:
        return None
    return datetime.strptime(raw, "%Y-%m-%d")


def close(conn):
    if conn is not None and conn.is_connected():
        conn.close()


@analysis_bp.post("/analyze")
def analyze():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return error("Request body must be valid JSON.")

    review = data.get("review")
    rating = data.get("rating")

    if not isinstance(review, str):
        return error("Review must be text.")
    review = review.strip()
    if not review:
        return error("Review cannot be empty.")
    if len(review) > Config.MAX_REVIEW_LENGTH:
        return error(f"Review is too long (max {Config.MAX_REVIEW_LENGTH} characters).")

    if rating is not None:
        if isinstance(rating, bool) or not isinstance(rating, int) or not 1 <= rating <= 5:
            return error("Rating must be a whole number from 1 to 5.")

    try:
        result = prediction_service.predict(review)
        terms = prediction_service.explain(review)
    except Exception:
        current_app.logger.exception("Prediction failed")
        return error("Could not analyze the review right now.", 500)

    signals = get_signals(review, rating)

    saved = False
    analysis_id = None
    user_id = optional_user_id()
    if user_id is not None:
        conn = None
        try:
            conn = get_connection()
            cur = conn.cursor()
            cur.execute(
                """
                INSERT INTO analyses
                  (user_id, review_text, rating, predicted_label, confidence_score, signals_json)
                VALUES (%s, %s, %s, %s, %s, %s)
                """,
                (
                    user_id,
                    review,
                    rating,
                    result["prediction"],
                    result["confidence"],
                    json.dumps({"signals": signals, "terms": terms}),
                ),
            )
            conn.commit()
            analysis_id = cur.lastrowid
            saved = True
        except mysql.connector.Error:
            current_app.logger.exception("Could not save analysis")
        finally:
            close(conn)

    return jsonify({
        **result,
        "signals": signals,
        "terms": terms,
        "saved": saved,
        "id": analysis_id,
        "message": "Review analyzed successfully",
    })


@analysis_bp.get("/history")
@jwt_required()
def history():
    user_id = int(get_jwt_identity())
    page = int_arg("page", 1, 1, 100000)
    per_page = int_arg("per_page", 10, 1, 50)
    label = request.args.get("label", "").strip().lower()
    q = request.args.get("q", "").strip()[:200]

    try:
        date_from = date_arg("date_from")
        date_to = date_arg("date_to")
    except ValueError:
        return error("Dates must look like 2026-10-31.")

    where = ["user_id = %s"]
    params = [user_id]
    if label in LABELS:
        where.append("predicted_label = %s")
        params.append(label)
    if q:
        where.append("review_text LIKE %s")
        params.append(f"%{q}%")
    if date_from:
        where.append("created_at >= %s")
        params.append(date_from)
    if date_to:
        where.append("created_at < %s")
        params.append(date_to + timedelta(days=1))
    where_sql = " AND ".join(where)

    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(f"SELECT COUNT(*) AS n FROM analyses WHERE {where_sql}", params)
        total = cur.fetchone()["n"]

        cur.execute(
            f"""
            SELECT id, LEFT(review_text, 120) AS preview, rating,
                   predicted_label, confidence_score, created_at
            FROM analyses
            WHERE {where_sql}
            ORDER BY created_at DESC, id DESC
            LIMIT %s OFFSET %s
            """,
            params + [per_page, (page - 1) * per_page],
        )
        rows = cur.fetchall()
    except mysql.connector.Error:
        current_app.logger.exception("Database error in history")
        return error("Database error. Please try again later.", 500)
    finally:
        close(conn)

    items = [
        {
            "id": r["id"],
            "preview": r["preview"],
            "rating": r["rating"],
            "label": r["predicted_label"],
            "confidence": float(r["confidence_score"]),
            "created_at": r["created_at"].isoformat(),
        }
        for r in rows
    ]
    pages = max(1, -(-total // per_page))
    return jsonify({
        "items": items,
        "page": page,
        "per_page": per_page,
        "total": total,
        "pages": pages,
    })


@analysis_bp.get("/history/<int:analysis_id>")
@jwt_required()
def history_detail(analysis_id):
    user_id = int(get_jwt_identity())
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)
        cur.execute(
            """
            SELECT id, review_text, rating, predicted_label, confidence_score,
                   signals_json, created_at
            FROM analyses
            WHERE id = %s AND user_id = %s
            """,
            (analysis_id, user_id),
        )
        r = cur.fetchone()
    except mysql.connector.Error:
        current_app.logger.exception("Database error in history detail")
        return error("Database error. Please try again later.", 500)
    finally:
        close(conn)

    if not r:
        return error("Analysis not found.", 404)

    signals, terms = [], []
    try:
        stored = json.loads(r["signals_json"]) if r["signals_json"] else []
        if isinstance(stored, dict):
            signals = stored.get("signals", [])
            terms = stored.get("terms", [])
        elif isinstance(stored, list):
            signals = stored
    except ValueError:
        pass

    return jsonify({
        "id": r["id"],
        "review": r["review_text"],
        "rating": r["rating"],
        "label": r["predicted_label"],
        "confidence": float(r["confidence_score"]),
        "signals": signals,
        "terms": terms,
        "created_at": r["created_at"].isoformat(),
    })


@analysis_bp.delete("/history/<int:analysis_id>")
@jwt_required()
def history_delete(analysis_id):
    user_id = int(get_jwt_identity())
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        cur.execute(
            "DELETE FROM analyses WHERE id = %s AND user_id = %s",
            (analysis_id, user_id),
        )
        conn.commit()
        deleted = cur.rowcount
    except mysql.connector.Error:
        current_app.logger.exception("Database error in delete")
        return error("Database error. Please try again later.", 500)
    finally:
        close(conn)

    if deleted == 0:
        return error("Analysis not found.", 404)
    return jsonify({"message": "Analysis deleted."})


@analysis_bp.get("/dashboard")
@jwt_required()
def dashboard():
    user_id = int(get_jwt_identity())
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor(dictionary=True)

        cur.execute(
            "SELECT predicted_label, COUNT(*) AS n FROM analyses "
            "WHERE user_id = %s GROUP BY predicted_label",
            (user_id,),
        )
        counts = {r["predicted_label"]: r["n"] for r in cur.fetchall()}

        cur.execute(
            """
            SELECT id, LEFT(review_text, 80) AS preview, predicted_label, created_at
            FROM analyses WHERE user_id = %s
            ORDER BY created_at DESC, id DESC LIMIT 5
            """,
            (user_id,),
        )
        recent = cur.fetchall()

        cur.execute(
            """
            SELECT DATE(created_at) AS day, COUNT(*) AS n
            FROM analyses
            WHERE user_id = %s AND created_at >= (NOW() - INTERVAL 7 DAY)
            GROUP BY DATE(created_at) ORDER BY day
            """,
            (user_id,),
        )
        daily = cur.fetchall()
    except mysql.connector.Error:
        current_app.logger.exception("Database error in dashboard")
        return error("Database error. Please try again later.", 500)
    finally:
        close(conn)

    return jsonify({
        "total": sum(counts.values()),
        "genuine": counts.get("genuine", 0),
        "suspicious": counts.get("suspicious", 0),
        "recent": [
            {
                "id": r["id"],
                "preview": r["preview"],
                "label": r["predicted_label"],
                "created_at": r["created_at"].isoformat(),
            }
            for r in recent
        ],
        "daily": [{"day": str(r["day"]), "count": r["n"]} for r in daily],
    })