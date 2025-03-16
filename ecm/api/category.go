package api

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	db "github.com/qhh/ecm/db/sqlc"
)

type createCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type categoryResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	CreatedAt   string    `json:"created_at"`
	UpdatedAt   string    `json:"updated_at"`
}

func newCategoryResponse(category db.Category) categoryResponse {
	description := ""
	if category.Description.Valid {
		description = category.Description.String
	}

	return categoryResponse{
		ID:          category.ID,
		Name:        category.Name,
		Description: description,
		CreatedAt:   category.CreatedAt.String(),
		UpdatedAt:   category.UpdatedAt.String(),
	}
}

func (server *Server) createCategory(ctx *gin.Context) {
	var req createCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Only admin can create categories
	if !server.isAdmin(ctx) {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("admin role required")))
		return
	}

	arg := db.CreateCategoryParams{
		Name: req.Name,
		Description: sql.NullString{
			String: req.Description,
			Valid:  req.Description != "",
		},
	}

	category, err := server.store.CreateCategory(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusCreated, newCategoryResponse(category))
}

func (server *Server) getCategory(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	category, err := server.store.GetCategory(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("category not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newCategoryResponse(category))
}

func (server *Server) listCategories(ctx *gin.Context) {
	categories, err := server.store.ListCategories(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]categoryResponse, len(categories))
	for i, category := range categories {
		response[i] = newCategoryResponse(category)
	}
	ctx.JSON(http.StatusOK, response)
}

type updateCategoryRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

func (server *Server) updateCategory(ctx *gin.Context) {
	// Only admin can update categories
	if !server.isAdmin(ctx) {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("admin role required")))
		return
	}

	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var req updateCategoryRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.UpdateCategoryParams{
		ID:   id,
		Name: req.Name,
		Description: sql.NullString{
			String: req.Description,
			Valid:  req.Description != "",
		},
	}

	category, err := server.store.UpdateCategory(ctx, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("category not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newCategoryResponse(category))
}
func (server *Server) deleteCategory(ctx *gin.Context) {
	// Only admin can delete categories
	if !server.isAdmin(ctx) {
		ctx.JSON(http.StatusForbidden, errorResponse(errors.New("admin role required")))
		return
	}

	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	err = server.store.DeleteCategory(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("category not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "category deleted successfully"})
}
