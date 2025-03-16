package api

import (
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	db "github.com/qhh/ecm/db/sqlc"
	"github.com/qhh/ecm/token"
	"github.com/qhh/ecm/util"
)

// Server serves HTTP requests for our e-commerce service
type Server struct {
	config     util.Config
	store      db.Store
	tokenMaker token.Maker
	router     *gin.Engine
}

// NewServer creates a new HTTP server and setup routing
func NewServer(config util.Config, store db.Store) (*Server, error) {
	tokenMaker, err := token.NewJWTMaker(config.JWTSecret)
	if err != nil {
		return nil, err
	}

	server := &Server{
		config:     config,
		store:      store,
		tokenMaker: tokenMaker,
	}

	server.setupRouter()
	return server, nil
}

// setupRouter sets up all the routes for our server
func (server *Server) setupRouter() {
	router := gin.Default()

	// Configure CORS - Updated configuration to fix OPTIONS request issue
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Content-Length", "Accept-Encoding", "X-CSRF-Token", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           86400, // Maximum value not ignored by any major browser (1 day)
	}))

	// Public routes
	router.POST("/users", server.createUser)
	router.POST("/users/login", server.loginUser)
	router.GET("/categories", server.listCategories)
	router.GET("/categories/:id", server.getCategory)
	router.GET("/products", server.listProducts)
	router.GET("/products/:id", server.getProduct)
	router.GET("/products/search", server.searchProducts)
	router.GET("/categories/:id/products", server.listProductsByCategory)

	// Routes that require authentication
	authRoutes := router.Group("/").Use(authMiddleware(server.tokenMaker))

	// User routes
	authRoutes.GET("/users/me", server.getCurrentUser)
	authRoutes.PATCH("/users/role", server.updateUserRole)

	// Shop routes
	authRoutes.POST("/shops", server.createShop)
	authRoutes.GET("/shops", server.listShops)
	authRoutes.GET("/shops/:id", server.getShop)
	authRoutes.PUT("/shops/:id", server.updateShop)
	authRoutes.DELETE("/shops/:id", server.deleteShop)
	authRoutes.GET("/shops/:id/products", server.listProductsByShop)

	// Product routes
	authRoutes.POST("/products", server.createProduct)
	authRoutes.PUT("/products/:id", server.updateProduct)
	authRoutes.DELETE("/products/:id", server.deleteProduct)

	// Category routes (admin only)
	authRoutes.POST("/categories", server.createCategory)
	authRoutes.PUT("/categories/:id", server.updateCategory)
	authRoutes.DELETE("/categories/:id", server.deleteCategory)

	// Cart routes
	authRoutes.GET("/cart", server.getCart)
	authRoutes.POST("/cart", server.addToCart)
	authRoutes.PUT("/cart", server.updateCartItem)
	authRoutes.DELETE("/cart/:productId", server.removeCartItem)
	authRoutes.DELETE("/cart", server.clearCart)

	// Order routes
	authRoutes.POST("/orders", server.createOrder)
	authRoutes.GET("/orders", server.getUserOrders)
	authRoutes.GET("/orders/:id", server.getOrder)
	authRoutes.PATCH("/orders/:id/status", server.updateOrderStatus)

	server.router = router
}

// Start runs the HTTP server on a specific address
func (server *Server) Start(address string) error {
	return server.router.Run(address)
}

// Helper method to check if user is admin
func (server *Server) isAdmin(ctx *gin.Context) bool {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	return authPayload.Role == "admin"
}
