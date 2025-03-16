// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: users.sql

package db

import (
	"context"

	"github.com/google/uuid"
)

const createUser = `-- name: CreateUser :one
INSERT INTO users (username, email, password_hash, role) 
VALUES ($1, $2, $3, $4)
RETURNING id, username, email, password_hash, role, created_at, updated_at
`

type CreateUserParams struct {
	Username     string   `json:"username"`
	Email        string   `json:"email"`
	PasswordHash string   `json:"password_hash"`
	Role         UserRole `json:"role"`
}

func (q *Queries) CreateUser(ctx context.Context, arg CreateUserParams) (User, error) {
	row := q.db.QueryRowContext(ctx, createUser,
		arg.Username,
		arg.Email,
		arg.PasswordHash,
		arg.Role,
	)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Email,
		&i.PasswordHash,
		&i.Role,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getUser = `-- name: GetUser :one
SELECT id, username, email, password_hash, role, created_at, updated_at FROM users
WHERE id = $1
`

func (q *Queries) GetUser(ctx context.Context, id uuid.UUID) (User, error) {
	row := q.db.QueryRowContext(ctx, getUser, id)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Email,
		&i.PasswordHash,
		&i.Role,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getUserByEmail = `-- name: GetUserByEmail :one
SELECT id, username, email, password_hash, role, created_at, updated_at FROM users
WHERE email = $1
`

func (q *Queries) GetUserByEmail(ctx context.Context, email string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserByEmail, email)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Email,
		&i.PasswordHash,
		&i.Role,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const getUserByUsername = `-- name: GetUserByUsername :one
SELECT id, username, email, password_hash, role, created_at, updated_at FROM users
WHERE username = $1
`

func (q *Queries) GetUserByUsername(ctx context.Context, username string) (User, error) {
	row := q.db.QueryRowContext(ctx, getUserByUsername, username)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Email,
		&i.PasswordHash,
		&i.Role,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const listUsers = `-- name: ListUsers :many
SELECT id, username, email, password_hash, role, created_at, updated_at FROM users
ORDER BY created_at
LIMIT $1 OFFSET $2
`

type ListUsersParams struct {
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

func (q *Queries) ListUsers(ctx context.Context, arg ListUsersParams) ([]User, error) {
	rows, err := q.db.QueryContext(ctx, listUsers, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []User{}
	for rows.Next() {
		var i User
		if err := rows.Scan(
			&i.ID,
			&i.Username,
			&i.Email,
			&i.PasswordHash,
			&i.Role,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateUserRole = `-- name: UpdateUserRole :one
UPDATE users
SET role = $2, updated_at = NOW()
WHERE id = $1
RETURNING id, username, email, password_hash, role, created_at, updated_at
`

type UpdateUserRoleParams struct {
	ID   uuid.UUID `json:"id"`
	Role UserRole  `json:"role"`
}

func (q *Queries) UpdateUserRole(ctx context.Context, arg UpdateUserRoleParams) (User, error) {
	row := q.db.QueryRowContext(ctx, updateUserRole, arg.ID, arg.Role)
	var i User
	err := row.Scan(
		&i.ID,
		&i.Username,
		&i.Email,
		&i.PasswordHash,
		&i.Role,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
