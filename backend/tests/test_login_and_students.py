def _login_and_get_token(client):
    response = client.post(
        "/login",
        json={"email": "admin@test.com", "password": "admin123"},
    )
    assert response.status_code == 200
    return response.get_json()["access_token"]


def test_login_success(client):
    response = client.post(
        "/login",
        json={"email": "admin@test.com", "password": "admin123"},
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["status"] == "authenticated"
    assert "access_token" in data
    assert "refresh_token" in data


def test_login_invalid_password(client):
    response = client.post(
        "/login",
        json={"email": "admin@test.com", "password": "wrong-pass"},
    )

    assert response.status_code == 401
    assert response.get_json()["error"] == "Invalid email or password"


def test_get_students_requires_auth(client):
    response = client.get("/api/students")

    assert response.status_code == 401
    assert response.get_json()["error"] == "Unauthorized"


def test_get_students_returns_seeded_student(client):
    token = _login_and_get_token(client)

    response = client.get(
        "/api/students",
        headers={"Authorization": f"Bearer {token}"},
    )

    data = response.get_json()

    assert response.status_code == 200
    assert len(data) == 1
    assert data[0]["student_id"] == "STU-2026-001"
    assert data[0]["name"] == "Kavi Perera"


def test_get_student_profile_returns_details(client):
    token = _login_and_get_token(client)

    response = client.get(
        "/api/students/STU-2026-001",
        headers={"Authorization": f"Bearer {token}"},
    )

    data = response.get_json()

    assert response.status_code == 200
    assert data["student_id"] == "STU-2026-001"
    assert data["name"] == "Kavi Perera"
    assert data["department"] == "Computing"


def test_get_student_profile_not_found(client):
    token = _login_and_get_token(client)

    response = client.get(
        "/api/students/STU-9999-999",
        headers={"Authorization": f"Bearer {token}"},
    )

    assert response.status_code == 404
    assert response.get_json()["error"] == "Student not found"
