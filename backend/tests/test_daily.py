def test_get_bosses_returns_seven(client):
    resp = client.get("/api/daily/bosses")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data) == 7
    assert data[0]["required_todos"] == 1   # ordered by difficulty


def test_no_session_before_selection(client, auth_headers):
    resp = client.get("/api/daily/session", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.get_json()["session"] is None


def test_select_boss_creates_session(client, auth_headers):
    bosses = client.get("/api/daily/bosses").get_json()
    resp = client.post("/api/daily/select-boss",
                       json={"boss_id": bosses[0]["id"]},
                       headers=auth_headers)
    assert resp.status_code == 201
    session = resp.get_json()["session"]
    assert session["boss_id"] == bosses[0]["id"]
    assert session["is_cleared"] is False
    assert session["hp_percentage"] == 100.0


def test_cannot_select_boss_twice(client, auth_headers):
    bosses = client.get("/api/daily/bosses").get_json()
    resp = client.post("/api/daily/select-boss",
                       json={"boss_id": bosses[1]["id"]},
                       headers=auth_headers)
    assert resp.status_code == 409
