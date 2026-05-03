def test_create_todo(client, auth_headers):
    resp = client.post("/api/todo/", json={"task_name": "Study Flask"}, headers=auth_headers)
    assert resp.status_code == 201
    assert resp.get_json()["todo"]["status"] == "pending"


def test_tick_todo_deals_damage(client, auth_headers):
    # Create a todo
    todo_id = client.post("/api/todo/",
                          json={"task_name": "Defeat radagon"},
                          headers=auth_headers).get_json()["todo"]["id"]

    resp = client.patch(f"/api/todo/tick/{todo_id}", headers=auth_headers)
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["todo"]["status"] == "done"
    assert body["session"]["current_todos_done"] >= 1
    assert body["session"]["hp_percentage"] < 100.0


def test_cannot_tick_twice(client, auth_headers):
    todo_id = client.post("/api/todo/",
                          json={"task_name": "Double tick"},
                          headers=auth_headers).get_json()["todo"]["id"]
    client.patch(f"/api/todo/tick/{todo_id}", headers=auth_headers)
    resp = client.patch(f"/api/todo/tick/{todo_id}", headers=auth_headers)
    assert resp.status_code == 409


def test_boss_clears_when_all_done(client, auth_headers):
    # The session already has 1 required todo (Malenia selected in test_daily).
    # Just check hp_percentage reaches 0 once cleared.
    session = client.get("/api/daily/session", headers=auth_headers).get_json()["session"]
    needed  = session["required_todos"] - session["current_todos_done"]
    last_resp = None
    for i in range(needed):
        t_id = client.post("/api/todo/",
                           json={"task_name": f"task {i}"},
                           headers=auth_headers).get_json()["todo"]["id"]
        last_resp = client.patch(f"/api/todo/tick/{t_id}", headers=auth_headers)
    if last_resp:
        body = last_resp.get_json()
        assert body["session"]["hp_percentage"] == 0.0
        assert body["boss_defeated"] is True
