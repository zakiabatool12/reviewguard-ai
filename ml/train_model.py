from pathlib import Path

import joblib
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, confusion_matrix
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline

# 1. File ke raste (kahin se bhi chalao, kaam karega)
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "reviews.csv"
MODEL_PATH = BASE_DIR / "review_model.pkl"

# 2. Data load aur saaf karo
df = pd.read_csv(DATA_PATH)
df = df.dropna(subset=["text", "label"])
df["text"] = df["text"].astype(str)
df = df.drop_duplicates(subset="text")

X = df["text"]
y = df["label"]

# 3. Train / test split (80% / 20%)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# 4. Model pipeline: TF-IDF + Logistic Regression
model = Pipeline([
    ("tfidf", TfidfVectorizer(ngram_range=(1, 2), max_features=50000)),
    ("classifier", LogisticRegression(max_iter=1000, class_weight="balanced")),
])

model.fit(X_train, y_train)

# 5. Test data par evaluate karo
predictions = model.predict(X_test)
print(classification_report(
    y_test, predictions, target_names=["original (0)", "computer-generated (1)"]
))
print("Confusion matrix:")
print(confusion_matrix(y_test, predictions))

# 6. Model save karo
joblib.dump(model, MODEL_PATH)
print("Model saved to", MODEL_PATH)