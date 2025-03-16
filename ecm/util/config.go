package util

import (
	"os"
	"time"
)

// Config holds all configuration for our application
type Config struct {
	DBDriver            string
	DBSource            string
	JWTSecret           string
	AccessTokenDuration time.Duration
}

// LoadConfig loads configuration from environment variables
func LoadConfig() (config Config, err error) {
	// Database configuration
	config.DBDriver = getEnv("DB_DRIVER", "postgres")
	config.DBSource = getEnv("DB_SOURCE", "postgresql://postgres:postgres@localhost:5432/ecm_db?sslmode=disable")

	// JWT configuration
	config.JWTSecret = getEnv("JWT_SECRET", "mysecretkey")
	tokenDuration := getEnv("ACCESS_TOKEN_DURATION", "15m")
	config.AccessTokenDuration, err = time.ParseDuration(tokenDuration)
	if err != nil {
		config.AccessTokenDuration = time.Minute * 15 // Default 15 minutes
	}

	return
}

// Helper function to get environment variable with default value
func getEnv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}
