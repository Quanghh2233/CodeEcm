# PostgreSQL
postgres:
	docker-compose up -d postgres

create-db:
	docker exec -it postgres createdb --username=postgres --owner=postgres ecm_db

drop-db:
	docker exec -it postgres dropdb --username=postgres ecm_db

migrate-up:
	migrate -path db/migration -database "postgresql://postgres:postgres@localhost:5432/ecm_db?sslmode=disable" -verbose up

migrate-down:
	migrate -path db/migration -database "postgresql://postgres:postgres@localhost:5432/ecm_db?sslmode=disable" -verbose down

sqlc:
	sqlc generate

# Server
server:
	go run ./cmd/server/main.go

# Frontend
start-frontend:
	cd frontend && npm start

# Docker
docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

# All in one command
start-all: docker-up migrate-up server

test:
	go test -v ./...

.PHONY: postgres create-db drop-db migrate-up migrate-down sqlc server start-frontend docker-up docker-down start-all test
