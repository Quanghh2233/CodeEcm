package api

import (
	"database/sql"
	"errors"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	db "github.com/qhh/ecm/db/sqlc"
	"github.com/qhh/ecm/token"
)

type createShopRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

type shopResponse struct {
	ID          uuid.UUID `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	OwnerID     uuid.UUID `json:"owner_id"`
	CreatedAt   string    `json:"created_at"`
	UpdatedAt   string    `json:"updated_at"`
}

func newShopResponse(shop db.Shop) shopResponse {
	description := ""
	if shop.Description.Valid {
		description = shop.Description.String
	}

	return shopResponse{
		ID:          shop.ID,
		Name:        shop.Name,
		Description: description,
		OwnerID:     shop.OwnerID,
		CreatedAt:   shop.CreatedAt.String(),
		UpdatedAt:   shop.UpdatedAt.String(),
	}
}

func (server *Server) createShop(ctx *gin.Context) {
	var req createShopRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Only sellers and admins can create shops
	if authPayload.Role != "seller" && authPayload.Role != "admin" {
		err := errors.New("only sellers can create shops")
		ctx.JSON(http.StatusForbidden, errorResponse(err))
		return
	}

	arg := db.CreateShopParams{
		Name: req.Name,
		Description: sql.NullString{
			String: req.Description,
			Valid:  req.Description != "",
		},
		OwnerID: authPayload.UserID,
	}

	shop, err := server.store.CreateShop(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusCreated, newShopResponse(shop))
}

func (server *Server) getShop(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	shop, err := server.store.GetShop(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("shop not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newShopResponse(shop))
}

type listShopsRequest struct {
	PageID   int32 `form:"page_id" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=10"`
}

func (server *Server) listShops(ctx *gin.Context) {
	var req listShopsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	var shops []db.Shop
	var err error

	// If user is admin, list all shops, otherwise list only user's shops
	if authPayload.Role == "admin" {
		arg := db.ListShopsParams{
			Limit:  req.PageSize,
			Offset: (req.PageID - 1) * req.PageSize,
		}
		shops, err = server.store.ListShops(ctx, arg)
	} else {
		shops, err = server.store.ListShopsByOwner(ctx, authPayload.UserID)
	}

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]shopResponse, len(shops))
	for i, shop := range shops {
		response[i] = newShopResponse(shop)
	}
	ctx.JSON(http.StatusOK, response)
}

type updateShopRequest struct {
	Name        string `json:"name" binding:"required"`
	Description string `json:"description"`
}

func (server *Server) updateShop(ctx *gin.Context) {
	var req updateShopRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	shop, err := server.store.GetShop(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("shop not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if shop.OwnerID != authPayload.UserID && authPayload.Role != "admin" {
		err := errors.New("you don't have permission to update this shop")
		ctx.JSON(http.StatusForbidden, errorResponse(err))
		return
	}

	arg := db.UpdateShopParams{
		ID:   id,
		Name: req.Name,
		Description: sql.NullString{
			String: req.Description,
			Valid:  req.Description != "",
		},
	}

	updatedShop, err := server.store.UpdateShop(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newShopResponse(updatedShop))
}

func (server *Server) deleteShop(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	shop, err := server.store.GetShop(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("shop not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if shop.OwnerID != authPayload.UserID && authPayload.Role != "admin" {
		err := errors.New("you don't have permission to delete this shop")
		ctx.JSON(http.StatusForbidden, errorResponse(err))
		return
	}

	err = server.store.DeleteShop(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "shop deleted successfully"})
}
