package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/joho/godotenv"
	_ "github.com/lib/pq"
	"github.com/qhh/ecm/api"
	db "github.com/qhh/ecm/db/sqlc"
	"github.com/qhh/ecm/util"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using environment variables")
	}

	config, err := util.LoadConfig()
	if err != nil {
		log.Fatal("Cannot load config:", err)
	}

	conn, err := sql.Open(config.DBDriver, config.DBSource)
	if err != nil {
		log.Fatal("Cannot connect to db:", err)
	}

	// Create a store
	store := db.NewStore(conn)

	// Seed admin user
	err = util.SeedAdminUser(store)
	if err != nil {
		log.Println("Warning: Failed to seed admin user:", err)
	}

	// Create and start a server
	server, err := api.NewServer(config, store)
	if err != nil {
		log.Fatal("Cannot create server:", err)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8000" // Default port
	}

	err = server.Start(":" + port)
	if err != nil {
		log.Fatal("Cannot start server:", err)
	}
}
