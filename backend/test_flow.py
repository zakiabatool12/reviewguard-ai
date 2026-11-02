"""End-to-end API check: login, save, list, detail, delete.
Run with the backend already running:  python test_flow.py
"""
import getpass
import requests

BASE = "http://localhost:5000"


def check(name, ok, extra=""):
    print(("PASS  " if ok else "FAIL  ") + name + (f"  ({extra})" if extra else ""))
    return ok

email = input("Verified account email: ").strip()
password = input("Password: ")


s = requests.Session()

# 1. Guests cannot see history
r = s.get(f"{BASE}/api/history")
check("History blocked when not logged in", r.status_code == 401, r.status_code)

# 2. Login
r = s.post(f"{BASE}/api/auth/login", json={"email": email, "password": password})
if not check("Login", r.status_code == 200, r.status_code):
    print(r.text)
    raise SystemExit(1)

csrf = s.cookies.get("csrf_access_token")
headers = {"X-CSRF-TOKEN": csrf} if csrf else {}

# 3. Analyze and save
r = s.post(
    f"{BASE}/api/analyze",
    json={"review": "Amazing!!! Best ever, everyone must buy this now!!!", "rating": 5},
    headers=headers,
)
body = r.json() if r.ok else {}
check("Analyze works", r.status_code == 200, r.status_code)
check("Analysis was saved", body.get("saved") is True, body.get("id"))
new_id = body.get("id")

# 4. History list
r = s.get(f"{BASE}/api/history?page=1&per_page=10")
data = r.json() if r.ok else {}
check("History list", r.status_code == 200 and data.get("total", 0) >= 1, f"total={data.get('total')}")

# 5. Detail
r = s.get(f"{BASE}/api/history/{new_id}")
check("History detail", r.status_code == 200, r.status_code)

# 6. Non-existing / other user's record
r = s.get(f"{BASE}/api/history/99999999")
check("Unknown record returns 404", r.status_code == 404, r.status_code)

# 7. Dashboard
r = s.get(f"{BASE}/api/dashboard")
check("Dashboard stats", r.status_code == 200 and "total" in r.json(), r.status_code)

# 8. Delete
r = s.delete(f"{BASE}/api/history/{new_id}", headers=headers)
check("Delete own analysis", r.status_code == 200, r.status_code)
r = s.delete(f"{BASE}/api/history/{new_id}", headers=headers)
check("Delete again returns 404", r.status_code == 404, r.status_code)