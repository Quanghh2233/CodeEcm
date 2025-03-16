package util

import (
	"context"
	"database/sql"
	"log"

	db "github.com/qhh/ecm/db/sqlc"
)

// SeedAdminUser creates an admin user if it doesn't exist
func SeedAdminUser(store db.Store) error {
	ctx := context.Background()

	// Check if admin user exists
	_, err := store.GetUserByUsername(ctx, "admin")
	if err != nil && err != sql.ErrNoRows {
		return err
	}

	// If admin already exists, return
	if err == nil {
		log.Println("Admin user already exists")
		return nil
	}

	// Create admin user
	hashedPassword, err := HashPassword("admin123")
	if err != nil {
		return err
	}

	arg := db.CreateUserParams{
		Username:     "admin",
		Email:        "admin@example.com",
		PasswordHash: hashedPassword,
		Role:         "admin",
	}

	_, err = store.CreateUser(ctx, arg)
	if err != nil {
		return err
	}

	log.Println("Admin user created successfully")
	return nil
}
