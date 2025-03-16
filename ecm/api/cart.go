package api

import (
	"database/sql"
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	db "github.com/qhh/ecm/db/sqlc"
	"github.com/qhh/ecm/token"
)

type addToCartRequest struct {
	ProductID string `json:"product_id" binding:"required"`
	Quantity  int32  `json:"quantity" binding:"required,gt=0"`
}

type cartItemResponse struct {
	ID          uuid.UUID `json:"id"`
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Quantity    int32     `json:"quantity"`
	Price       float64   `json:"price"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   string    `json:"created_at"`
	UpdatedAt   string    `json:"updated_at"`
}

func newCartItemResponse(cartItem db.GetCartItemsRow) cartItemResponse {
	price, _ := strconv.ParseFloat(cartItem.Price, 64)
	imageURL := ""
	if cartItem.ImageUrl.Valid {
		imageURL = cartItem.ImageUrl.String
	}
	
	return cartItemResponse{
		ID:          cartItem.ID,
		ProductID:   cartItem.ProductID,
		ProductName: cartItem.ProductName,
		Quantity:    cartItem.Quantity,
		Price:       price,
		ImageURL:    imageURL,
		CreatedAt:   cartItem.CreatedAt.String(),
		UpdatedAt:   cartItem.UpdatedAt.String(),
	}
}

func (server *Server) addToCart(ctx *gin.Context) {
	var req addToCartRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Parse product ID
	productID, err := uuid.Parse(req.ProductID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check if product exists and has enough stock
	product, err := server.store.GetProduct(ctx, productID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("product not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if product.StockQuantity < req.Quantity {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("insufficient stock")))
		return
	}

	arg := db.AddToCartParams{
		UserID:    authPayload.UserID,
		ProductID: productID,
		Quantity:  req.Quantity,
	}

	cartItem, err := server.store.AddToCart(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, cartItem)
}

type updateCartItemRequest struct {
	ProductID string `json:"product_id" binding:"required"`
	Quantity  int32  `json:"quantity" binding:"required,gt=0"`
}

func (server *Server) updateCartItem(ctx *gin.Context) {
	var req updateCartItemRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Parse product ID
	productID, err := uuid.Parse(req.ProductID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Check if product exists and has enough stock
	product, err := server.store.GetProduct(ctx, productID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("product not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if product.StockQuantity < req.Quantity {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("insufficient stock")))
		return
	}

	arg := db.UpdateCartQuantityParams{
		UserID:    authPayload.UserID,
		ProductID: productID,
		Quantity:  req.Quantity,
	}

	cartItem, err := server.store.UpdateCartQuantity(ctx, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("cart item not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, cartItem)
}

func (server *Server) removeCartItem(ctx *gin.Context) {
	productID, err := uuid.Parse(ctx.Param("productId"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	arg := db.RemoveFromCartParams{
		UserID:    authPayload.UserID,
		ProductID: productID,
	}

	err = server.store.RemoveFromCart(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "item removed from cart"})
}

func (server *Server) getCart(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	cartItems, err := server.store.GetCartItems(ctx, authPayload.UserID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]cartItemResponse, len(cartItems))
	for i, item := range cartItems {
		response[i] = newCartItemResponse(item)
	}

	ctx.JSON(http.StatusOK, response)
}

func (server *Server) clearCart(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	err := server.store.ClearCart(ctx, authPayload.UserID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "cart cleared"})
}
