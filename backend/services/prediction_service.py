import joblib
import numpy as np
from config import Config

# Dataset ke labels ko user-friendly naam dena.
# Pehle check karo: python -c "import joblib; print(joblib.load('../ml/review_model.pkl').classes_)"
# Aap ke labels jo bhi hon, unhe yahan map karo.
LABEL_MAP = {
    "OR": "genuine",      # original
    "CG": "suspicious",   # computer-generated
    "genuine": "genuine",
    "fake": "suspicious",
    "suspicious": "suspicious",
    0: "genuine",
    1: "suspicious",
}

class PredictionService:
    def __init__(self, model_path):
        self.model = joblib.load(model_path)
        self.classes = list(self.model.classes_)

    def predict(self, text: str) -> dict:
        probs = self.model.predict_proba([text])[0]
        idx = int(np.argmax(probs))
        raw_label = self.classes[idx]
        # numpy types ko python types mein badlo
        if hasattr(raw_label, "item"):
            raw_label = raw_label.item()

        return {
            "prediction": LABEL_MAP.get(raw_label, str(raw_label)),
            "confidence": round(float(probs[idx]), 4),
            "probabilities": {
                str(LABEL_MAP.get(c.item() if hasattr(c, "item") else c, c)): round(float(p), 4)
                for c, p in zip(self.classes, probs)
            },
        }

# Module import hote hi ek dafa load
prediction_service = PredictionService(Config.MODEL_PATH)