import re
from collections import Counter

PROMO_WORDS = [
    "must buy", "buy now", "best ever", "100%", "guaranteed",
    "highly recommend", "life changing", "amazing product", "everyone should",
]
POSITIVE = ["excellent", "amazing", "perfect", "great", "love", "best", "awesome", "good"]
NEGATIVE = ["terrible", "worst", "bad", "awful", "waste", "broken", "poor", "hate", "disappointed"]

def get_signals(text: str, rating=None) -> list[dict]:
    signals = []
    lower = text.lower()
    words = re.findall(r"[a-zA-Z']+", lower)

    if re.search(r"[!?]{3,}", text):
        signals.append({"type": "repeated_punctuation",
                        "message": "Repeated punctuation found (e.g. !!!)."})

    if len(words) < 4:
        signals.append({"type": "very_short",
                        "message": "Very short review with little detail."})

    promo = [p for p in PROMO_WORDS if p in lower]
    if promo:
        signals.append({"type": "promotional_language",
                        "message": f"Promotional wording: {', '.join(promo)}."})

    counts = Counter(words)
    repeated = [w for w, c in counts.items() if c >= 4 and len(w) > 3]
    if repeated:
        signals.append({"type": "repeated_words",
                        "message": f"Words repeated many times: {', '.join(repeated)}."})

    if rating is not None:
        pos = sum(w in POSITIVE for w in words)
        neg = sum(w in NEGATIVE for w in words)
        if rating <= 2 and pos > neg:
            signals.append({"type": "rating_mismatch",
                            "message": "Low rating but mostly positive wording."})
        elif rating >= 4 and neg > pos:
            signals.append({"type": "rating_mismatch",
                            "message": "High rating but mostly negative wording."})

    return signals