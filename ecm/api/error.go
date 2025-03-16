package api

import (
	"github.com/gin-gonic/gin"
)

// errorResponse is a generic error response structure
func errorResponse(err error) gin.H {
	return gin.H{"error": err.Error()}
}
