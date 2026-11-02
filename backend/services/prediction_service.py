import joblib
import numpy as np
from config import Config

# Map the dataset's labels to user-friendly names.
LABEL_MAP = {
    "OR": "genuine",
    "CG": "suspicious",
    "genuine": "genuine",
    "fake": "suspicious",
    "suspicious": "suspicious",
    0: "genuine",
    1: "suspicious",
}


def _plain(value):
    return value.item() if hasattr(value, "item") else value


class PredictionService:
    def __init__(self, model_path):
        self.model = joblib.load(model_path)
        self.classes = list(self.model.classes_)

    def predict(self, text: str) -> dict:
        probs = self.model.predict_proba([text])[0]
        idx = int(np.argmax(probs))
        raw_label = _plain(self.classes[idx])

        return {
            "prediction": LABEL_MAP.get(raw_label, str(raw_label)),
            "confidence": round(float(probs[idx]), 4),
            "probabilities": {
                str(LABEL_MAP.get(_plain(c), _plain(c))): round(float(p), 4)
                for c, p in zip(self.classes, probs)
            },
        }

    def explain(self, text: str, top_n: int = 5) -> list:
        """Words that pushed the model toward its predicted class.
        Returns [] if the pipeline does not have the expected steps."""
        try:
            tfidf = self.model.named_steps["tfidf"]
            clf = self.model.named_steps["classifier"]
            vec = tfidf.transform([text])
            if vec.nnz == 0:
                return []

            pred_idx = int(np.argmax(self.model.predict_proba([text])[0]))
            if clf.coef_.shape[0] == 1:
                sign = 1.0 if pred_idx == 1 else -1.0
                weights = clf.coef_[0] * sign
            else:
                weights = clf.coef_[pred_idx]

            names = tfidf.get_feature_names_out()
            idxs = vec.indices
            contrib = vec.data * weights[idxs]
            order = np.argsort(contrib)[::-1][:top_n]
            return [
                {"term": str(names[idxs[i]]), "weight": round(float(contrib[i]), 4)}
                for i in order
                if contrib[i] > 0
            ]
        except Exception:
            return []


prediction_service = PredictionService(Config.MODEL_PATH)