from pathlib import Path

import joblib

MODEL_PATH = Path(__file__).resolve().parent / "review_model.pkl"
model = joblib.load(MODEL_PATH)

reviews = [
    "This product is excellent and works perfectly.",
    "Amazing!!! Perfect!!! Everyone must buy this now!!!",
    "Arrived late, the zip broke after two weeks, not happy.",
    "Great.",
]

# classes_ ka order: [0, 1]  (0 = original, 1 = computer-generated)
probabilities = model.predict_proba(reviews)

for text, prob in zip(reviews, probabilities):
    label = "computer-generated-like (1)" if prob[1] >= 0.5 else "original-like (0)"
    print(f"{label} | score for class 1: {prob[1]:.2f}")
    print(f"  {text}\n")