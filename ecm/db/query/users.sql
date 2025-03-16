-- name: CreateUser :one
INSERT INTO users (username, email, password_hash, role) 
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetUser :one
SELECT * FROM users
WHERE id = $1;

-- name: GetUserByUsername :one
SELECT * FROM users
WHERE username = $1;

-- name: GetUserByEmail :one
SELECT * FROM users
WHERE email = $1;

-- name: UpdateUserRole :one
UPDATE users
SET role = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: ListUsers :many
SELECT * FROM users
ORDER BY created_at
LIMIT $1 OFFSET $2;
