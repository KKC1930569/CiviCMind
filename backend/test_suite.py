import io
import time
from fastapi.testclient import TestClient
from app.main import app

def run_tests():
    with TestClient(app) as client:
        print("=== STARTING CIVICMIND FULL INTEGRATION & AUTH TEST SUITE ===")

        # 1. Health
        r = client.get("/api/health")
        assert r.status_code == 200, f"Health check failed: {r.status_code}"
        print("PASS: GET /api/health returns 200 OK")

        # 2. Citizen Registration
        unique_cit_email = f"test_citizen_{int(time.time())}@civicmind.org"
        r = client.post("/api/auth/register", json={
            "full_name": "Test Citizen User",
            "email": unique_cit_email,
            "password": "SecurePassword123!"
        })
        assert r.status_code == 201, f"Citizen registration failed: {r.text}"
        cit_data = r.json()
        assert cit_data["role"] == "CITIZEN"
        assert cit_data["email"] == unique_cit_email
        print(f"PASS: Citizen Registration successful: {cit_data['email']} (role: {cit_data['role']})")

        # 3. Duplicate Email Rejection
        r_dup = client.post("/api/auth/register", json={
            "full_name": "Duplicate User",
            "email": unique_cit_email,
            "password": "AnotherPassword123!"
        })
        assert r_dup.status_code == 400
        assert "already exists" in r_dup.json()["detail"]
        print("PASS: Duplicate email correctly rejected with 400 Bad Request")

        # 4. Authority Registration
        unique_auth_email = f"test_officer_{int(time.time())}@civicmind.org"
        r = client.post("/api/auth/register/authority", json={
            "full_name": "Chief Marcus Vance",
            "email": unique_auth_email,
            "password": "AuthoritySecure123!",
            "department": "ADA & Universal Mobility Division",
            "access_code": "CIVIC-AUTHORITY-2026"
        })
        assert r.status_code == 201, f"Authority registration failed: {r.text}"
        auth_data = r.json()
        assert auth_data["role"] == "AUTHORITY"
        print(f"PASS: Authority Registration successful: {auth_data['email']} (role: {auth_data['role']})")

        # 5. Invalid Authority Access Code Rejection
        r_invalid_code = client.post("/api/auth/register/authority", json={
            "full_name": "Unauthorized User",
            "email": f"bad_officer_{int(time.time())}@gmail.com",
            "password": "AuthoritySecure123!",
            "department": "Public Works",
            "access_code": "INVALID-CODE-999"
        })
        assert r_invalid_code.status_code == 400
        assert "authorization code" in r_invalid_code.json()["detail"].lower()
        print("PASS: Invalid authority access code rejected with 400 Bad Request")

        # 6. Citizen Login with newly registered user
        r = client.post("/api/auth/login", json={
            "email": unique_cit_email,
            "password": "SecurePassword123!"
        })
        assert r.status_code == 200, f"Login failed: {r.text}"
        citizen_token = r.json()["access_token"]
        citizen_headers = {"Authorization": f"Bearer {citizen_token}"}
        print("PASS: Citizen login successful with JWT issued")

        # 7. Invalid password rejection
        r_bad_pw = client.post("/api/auth/login", json={
            "email": unique_cit_email,
            "password": "WrongPassword999!"
        })
        assert r_bad_pw.status_code == 401
        print("PASS: Invalid password rejected with 401 Unauthorized")

        # 8. GET /api/auth/me with valid JWT
        r_me = client.get("/api/auth/me", headers=citizen_headers)
        assert r_me.status_code == 200
        assert r_me.json()["email"] == unique_cit_email
        print(f"PASS: GET /api/auth/me verified: {r_me.json()['full_name']} ({r_me.json()['role']})")

        # 9. Forgot Password Workflow
        r_forgot = client.post("/api/auth/forgot-password", json={
            "email": unique_cit_email
        })
        assert r_forgot.status_code == 200
        forgot_data = r_forgot.json()
        assert "password reset instructions" in forgot_data["message"]
        reset_token = forgot_data["dev_reset_token"]
        assert reset_token is not None
        print(f"PASS: Forgot Password token generated: {reset_token[:16]}...")

        # 10. Reset Password Workflow
        r_reset = client.post("/api/auth/reset-password", json={
            "token": reset_token,
            "new_password": "NewResetPassword2026!"
        })
        assert r_reset.status_code == 200
        assert r_reset.json()["success"] is True
        print("PASS: Password successfully reset with Argon2 encryption")

        # 11. Old password rejected, new password accepted
        r_old = client.post("/api/auth/login", json={
            "email": unique_cit_email,
            "password": "SecurePassword123!"
        })
        assert r_old.status_code == 401
        print("PASS: Old password confirmed unusable")

        r_new = client.post("/api/auth/login", json={
            "email": unique_cit_email,
            "password": "NewResetPassword2026!"
        })
        assert r_new.status_code == 200
        print("PASS: New password confirmed working")

        # 12. Single-use token enforcement (re-using reset token rejected)
        r_reuse = client.post("/api/auth/reset-password", json={
            "token": reset_token,
            "new_password": "AnotherNewPassword!"
        })
        assert r_reuse.status_code == 400
        print("PASS: Re-using expired/used token rejected with 400 Bad Request")

        # 13. Create Report with Accessibility Barrier & Camera Evidence
        fake_img = io.BytesIO(b"\xff\xd8\xff\xe0\x00\x10JFIF\x00\x01\x01\x01\x00`\x00`\x00\x00\xff\xdb\x00C\x00")
        r = client.post("/api/reports", headers=citizen_headers, data={
            "title": "Severe Wheelchair Ramp Obstruction",
            "description": "Concrete blocks completely obstruct the primary wheelchair ramp to the medical clinic.",
            "category": "ACCESSIBILITY",
            "location_type": "GPS",
            "latitude": 37.7749,
            "longitude": -122.4194,
            "address": "Market St near Clinic",
            "severity": "CRITICAL",
            "accessibility_barrier": "RAMP",
            "affects_mobility_impaired": "true",
            "location_context": "HOSPITAL_CLINIC",
            "capture_source": "CAMERA"
        }, files={
            "image": ("ramp_hazard.jpg", fake_img, "image/jpeg")
        })
        assert r.status_code == 201, f"Report create failed: {r.text}"
        rep = r.json()
        assert 80 <= rep["human_impact_score"] <= 100
        assert rep["priority_level"] == "CRITICAL"
        rep_id = rep["id"]
        print(f"PASS: Human Impact Engine evaluated Report #{rep_id} -> Score: {rep['human_impact_score']}/100 | Priority: {rep['priority_level']}")

        # 14. What-If Repair Simulator
        r = client.post(f"/api/reports/{rep_id}/simulate-repair", headers=citizen_headers)
        assert r.status_code == 200
        sim = r.json()
        assert sim["simulated_impact_score"] < sim["current_impact_score"]
        print(f"PASS: What-If Repair Simulator: Before={sim['current_impact_score']} -> After={sim['simulated_impact_score']}")

        # 15. Authority Login & Municipal Work Order
        r = client.post("/api/auth/login", json={
            "email": "authority@civicmind.org",
            "password": "Authority123!"
        })
        assert r.status_code == 200
        auth_token = r.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {auth_token}"}

        r = client.get(f"/api/reports/{rep_id}/work-order", headers=auth_headers)
        assert r.status_code == 200
        wo = r.json()
        assert wo["work_order_id"].startswith("WO-")
        print(f"PASS: Municipal Work Order generated: ID={wo['work_order_id']}, Dept={wo['assigned_department']}")

        print("\nALL CIVICMIND INTELLIGENCE & AUTHENTICATION TESTS PASSED WITH 100% SUCCESS!")

if __name__ == "__main__":
    run_tests()
