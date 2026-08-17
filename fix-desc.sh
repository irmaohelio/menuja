#!/bin/bash
cd /d/loja-digital
curl -s -D /tmp/h.txt http://localhost:3000/api/auth/login -X POST -H "Content-Type: application/json" -d '{"email":"teste@teste.com","password":"123456"}' > /dev/null
TOKEN=$(cat /tmp/h.txt | tr -d '\r\n' | sed 's/.*token=//' | sed 's/;.*//')
echo "Token len: ${#TOKEN}"
BODY='{"storeData":{"description":"Pizzaria Santos\nPizzas assadas no forno a lenha, qualidade e tradição!"}}'
curl -s http://localhost:3000/api/store/settings -X PUT -H "Content-Type: application/json" -H "Cookie: token=$TOKEN" -d "$BODY"
echo ""
echo "--- Verify ---"
curl -s http://localhost:3000/api/store/pizzaria-santos | python -c "import sys,json; d=json.load(sys.stdin); print(repr(d['store']['description']))"
