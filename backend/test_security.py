"""Quick security tests. Backend must be running.  python test_security.py"""
import requests

BASE = "http://localhost:5000"


def check(name, ok, extra=""):
    print(("PASS  " if ok else "FAIL  ") + name + (f"  ({extra})" if extra else ""))


# 1. Security headers
r = requests.get(f"{BASE}/api/health")
h = r.headers
check("X-Content-Type-Options header", h.get("X-Content-Type-Options") == "nosniff")
check("X-Frame-Options header", h.get("X-Frame-Options") == "DENY")
check("API responses are not cached", "no-store" in h.get("Cache-Control", ""))

# 2. Protected routes reject guests
for path in ("/api/history", "/api/dashboard", "/api/auth/me"):
    r = requests.get(BASE + path)
    check(f"{path} blocked when logged out", r.status_code == 401, r.status_code)

# 3. Input validation
r = requests.post(f"{BASE}/api/analyze", json={"review": "   "})
check("Empty review rejected", r.status_code == 400, r.status_code)
r = requests.post(f"{BASE}/api/analyze", json={"review": "ok", "rating": 9})
check("Invalid rating rejected", r.status_code == 400, r.status_code)
r = requests.post(f"{BASE}/api/analyze", json={"review": "a" * 5001})
check("Too long review rejected", r.status_code == 400, r.status_code)
r = requests.post(f"{BASE}/api/analyze", data="x" * (200 * 1024),
                  headers={"Content-Type": "application/json"})
check("Oversized request rejected", r.status_code == 413, r.status_code)

# 4. SQL injection style input does not break login
r = requests.post(f"{BASE}/api/auth/login",
                  json={"email": "' OR '1'='1", "password": "' OR '1'='1"})
check("SQL injection text does not log in", r.status_code in (400, 401), r.status_code)

# 5. Rate limiting on login (this may block login for about a minute)
codes = []
for _ in range(14):
    codes.append(requests.post(f"{BASE}/api/auth/login",
                               json={"email": "nobody@example.com", "password": "wrong-password"}).status_code)
check("Repeated bad logins are rate limited", 429 in codes, f"codes={sorted(set(codes))}")
print("\nNote: wait about a minute before logging in again.")