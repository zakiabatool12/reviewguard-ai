# API Test Results

Date: 2026-10-30 11:27
Endpoint: POST /api/analyze

## Test 1: Valid review
Input: `{"review":"This product is excellent and works perfectly.","rating":5}`

```json
{
    "confidence":  0.8014,
    "message":  "Review analyzed successfully",
    "prediction":  "genuine",
    "probabilities":  {
                          "genuine":  0.8014,
                          "suspicious":  0.1986
                      },
    "signals":  [

                ]
}
```
Result: **PASS**

## Test 2: Empty review
Input: `{"review":"   "}`

```json
{
  "error": "Review cannot be empty."
}
```
Result: **PASS**

## Test 3: Invalid rating
Input: `{"review":"Nice product","rating":9}`

```json
{
  "error": "Rating must be a whole number from 1 to 5."
}
```
Result: **PASS**

## Test 4: Non-string review
Input: `{"review":123}`

```json
{
  "error": "Review must be text."
}
```
Result: **PASS**

## Test 5: Too long review
Input: `{"review":"aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa... (5014 characters)`

```json
{
  "error": "Review is too long (max 5000 characters)."
}
```
Result: **PASS**

## Test 6: Model-loading error
Setup: MODEL_PATH was set to a non-existent file (wrong.pkl) and the app was started.
Output: FileNotFoundError: No such file or directory: wrong.pkl
Result: **PASS** (app refuses to start without a valid model)
