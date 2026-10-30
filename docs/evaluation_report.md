# Model Evaluation Report (Initial)

## Dataset
- Source: Kaggle "Fake Reviews Dataset" (Arijit Das), processed version of a public fake reviews dataset
- Rows: 40,526 (33 duplicate texts removed before training)
- Labels: 0 = original reviews (presumably human, authentic), 1 = computer-generated fake reviews
- Class distribution: 20,232 (label 0) and 20,294 (label 1), approximately balanced

## Method
- Model: TF-IDF (unigrams and bigrams, up to 50,000 features) + Logistic Regression (class_weight="balanced")
- Split: 80% train, 20% test (8,099 test reviews), stratified, random_state=42

## Results (test set)
- Accuracy: about 0.93
- Weighted precision, recall, F1: 0.93, 0.93, 0.93
- Confusion matrix: [[3817, 229], [316, 3737]]

## Known limitations
- "Fake" means computer-generated text, not paid or human-written fake reviews, so the score may not hold on real marketplace reviews such as Daraz.
- Trained on English only; Roman Urdu is not supported yet.
- Very short reviews (for example "Great.") give scores close to 0.5 and are unreliable.
- A model probability is not a calibrated probability that a review is fake. Results are warning signs, not proof.