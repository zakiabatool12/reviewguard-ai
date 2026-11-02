import os
import sys
from datetime import date

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import train_test_split

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
CSV = os.path.join(ROOT, "ml", "data", "reviews.csv")
MODEL = os.path.join(ROOT, "ml", "review_model.pkl")
OUT = os.path.join(ROOT, "docs", "model_metrics.md")

df = pd.read_csv(CSV)
text_col = next((c for c in ("review_text", "text_", "text", "review") if c in df.columns), None)
label_col = next((c for c in ("label", "class", "target") if c in df.columns), None)
if text_col is None or label_col is None:
    print("Could not find the text/label columns. Columns found:", list(df.columns))
    sys.exit(1)

df = df.dropna(subset=[text_col, label_col]).copy()
df[text_col] = df[text_col].astype(str)
total = len(df)
duplicates = int(df.duplicated(subset=[text_col]).sum())

X, y = df[text_col], df[label_col]
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

model = joblib.load(MODEL)
pred = model.predict(X_test)
classes = list(model.classes_)

acc = accuracy_score(y_test, pred)
report = classification_report(y_test, pred, digits=4)
cm = confusion_matrix(y_test, pred, labels=classes)
overlap = len(set(X_test) & set(X_train))
dist = y.value_counts()

lines = [
    "# Model Evaluation Metrics", "",
    f"Generated on {date.today().isoformat()} by ml/evaluate_model.py.", "",
    "## Dataset",
    f"- Records after removing missing values: {total}",
    f"- Duplicate review texts: {duplicates}",
    "- Class distribution:",
]
for label, count in dist.items():
    lines.append(f"  - {label}: {count} ({count / total:.1%})")
lines += [
    "", "## Method",
    "- TF-IDF (unigrams and bigrams) + Logistic Regression",
    "- 80% training / 20% testing, stratified, random_state=42",
    f"- Test set size: {len(X_test)}",
    "", "## Results on the test set",
    f"- Accuracy: {acc:.4f}", "", "```", report, "```", "",
    "### Confusion matrix", "",
    "| Actual / Predicted | " + " | ".join(str(c) for c in classes) + " |",
    "|---|" + "---|" * len(classes),
]
for i, c in enumerate(classes):
    lines.append(f"| {c} | " + " | ".join(str(int(v)) for v in cm[i]) + " |")
lines += [
    "", "## Possible data leakage",
    f"- {overlap} of {len(X_test)} test reviews ({overlap / len(X_test):.1%}) also appear word for word in the training set.",
]

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

print(f"Accuracy: {acc:.4f}")
print("Classes:", classes)
print(report)
print("Confusion matrix (rows = actual, columns = predicted):")
print(cm)
print(f"Dataset size: {total}; duplicates: {duplicates}; test reviews also in training: {overlap}")
print("Class distribution:")
print(dist)
print("Saved:", OUT)