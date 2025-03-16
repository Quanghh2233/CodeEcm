package token

import (
	"time"

	"github.com/google/uuid"
)

// Maker is an interface for managing tokens
type Maker interface {
	// CreateToken creates a new token for a specific user id, username and role
	CreateToken(userID uuid.UUID, username string, role string, duration time.Duration) (string, error)

	// VerifyToken checks if the token is valid or not
	VerifyToken(token string) (*Payload, error)
}
