# Model Evaluation Metrics

Generated on 2026-11-01 by ml/evaluate_model.py.

## Dataset
- Records after removing missing values: 40526
- Duplicate review texts: 33
- Class distribution:
  - 1: 20294 (50.1%)
  - 0: 20232 (49.9%)

## Method
- TF-IDF (unigrams and bigrams) + Logistic Regression
- 80% training / 20% testing, stratified, random_state=42
- Test set size: 8106

## Results on the test set
- Accuracy: 0.9489

```
              precision    recall  f1-score   support

           0     0.9445    0.9538    0.9491      4047
           1     0.9535    0.9441    0.9487      4059

    accuracy                         0.9489      8106
   macro avg     0.9490    0.9489    0.9489      8106
weighted avg     0.9490    0.9489    0.9489      8106

```

### Confusion matrix

| Actual / Predicted | 0 | 1 |
|---|---|---|
| 0 | 3860 | 187 |
| 1 | 227 | 3832 |

## Possible data leakage
- 10 of 8106 test reviews (0.1%) also appear word for word in the training set.
