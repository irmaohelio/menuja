import urllib.request
import json

# Login
login_req = urllib.request.Request(
    'http://localhost:3000/api/auth/login',
    data=json.dumps({"email": "teste@teste.com", "password": "123456"}).encode(),
    headers={"Content-Type": "application/json"}
)
login_resp = urllib.request.urlopen(login_req)
token = None
for header in login_resp.headers.get_all('set-cookie') or []:
    if 'token=' in header:
        token = header.split('token=')[1].split(';')[0]
        break
print(f"Token: {token[:20]}..." if token else "No token!")

# Update description
body = json.dumps({"storeData": {"description": "Pizzaria Santos\nPizzas assadas no forno a lenha, qualidade e tradição!"}})
put_req = urllib.request.Request(
    'http://localhost:3000/api/store/settings',
    data=body.encode(),
    headers={"Content-Type": "application/json", "Cookie": f"token={token}"},
    method='PUT'
)
put_resp = urllib.request.urlopen(put_req)
print("PUT:", put_resp.read().decode())

# Verify
get_req = urllib.request.Request('http://localhost:3000/api/store/pizzaria-santos')
get_resp = urllib.request.urlopen(get_req)
data = json.loads(get_resp.read())
print("Description:", repr(data['store']['description']))
