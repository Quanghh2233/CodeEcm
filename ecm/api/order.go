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

type createOrderRequest struct {
	ShippingAddress string `json:"shipping_address" binding:"required"`
	PaymentMethod   string `json:"payment_method" binding:"required"`
}

type orderItemResponse struct {
	ID          uuid.UUID `json:"id"`
	ProductID   uuid.UUID `json:"product_id"`
	ProductName string    `json:"product_name"`
	Quantity    int32     `json:"quantity"`
	Price       float64   `json:"price"`
	ImageURL    string    `json:"image_url"`
	CreatedAt   string    `json:"created_at"`
}

type orderResponse struct {
	ID              uuid.UUID           `json:"id"`
	UserID          uuid.UUID           `json:"user_id"`
	Status          string              `json:"status"`
	TotalAmount     float64             `json:"total_amount"`
	ShippingAddress string              `json:"shipping_address"`
	PaymentMethod   string              `json:"payment_method"`
	CreatedAt       string              `json:"created_at"`
	UpdatedAt       string              `json:"updated_at"`
	Items           []orderItemResponse `json:"items,omitempty"`
}

func newOrderResponse(order db.Order) orderResponse {
	// Handle total_amount conversion properly based on its actual type in the DB
	var totalAmount float64

	// Since TotalAmount is a string, convert it directly
	totalAmount, _ = strconv.ParseFloat(order.TotalAmount, 64)

	return orderResponse{
		ID:              order.ID,
		UserID:          order.UserID,
		Status:          string(order.Status),
		TotalAmount:     totalAmount,
		ShippingAddress: order.ShippingAddress,
		PaymentMethod:   order.PaymentMethod,
		CreatedAt:       order.CreatedAt.String(),
		UpdatedAt:       order.UpdatedAt.String(),
	}
}

func newOrderItemResponse(item db.GetOrderItemsRow) orderItemResponse {
	// Convert price based on its actual type
	var price float64

	// Handle price conversion - assuming item.Price is a string in the DB
	price, _ = strconv.ParseFloat(item.Price, 64)

	// Set quantity directly as it's already int32
	quantity := item.Quantity

	// Handle image URL
	var imageURL string
	if item.ImageUrl.Valid {
		imageURL = item.ImageUrl.String
	}

	return orderItemResponse{
		ID:          item.ID,
		ProductID:   item.ProductID,
		ProductName: item.ProductName,
		Quantity:    quantity,
		Price:       price,
		ImageURL:    imageURL,
		CreatedAt:   item.CreatedAt.String(),
	}
}

func (server *Server) createOrder(ctx *gin.Context) {
	var req createOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	// Get cart items
	cartItems, err := server.store.GetCartItems(ctx, authPayload.UserID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	if len(cartItems) == 0 {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("cart is empty")))
		return
	}

	// Calculate total amount
	var totalAmount float64
	for _, item := range cartItems {
		// Convert price based on its actual type
		var itemPrice float64
		// Assuming item.Price is already a string based on the error message
		itemPrice, _ = strconv.ParseFloat(item.Price, 64)

		// Get quantity as an int32
		var quantity int32
		quantity = item.Quantity // Assuming item.Quantity is already an int32

		totalAmount += itemPrice * float64(quantity)
	}

	// Create transaction
	tx, err := server.store.BeginTx(ctx)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}
	defer tx.Rollback()

	// Create order
	orderArg := db.CreateOrderParams{
		UserID:          authPayload.UserID,
		TotalAmount:     strconv.FormatFloat(totalAmount, 'f', 2, 64),
		ShippingAddress: req.ShippingAddress,
		PaymentMethod:   req.PaymentMethod,
	}

	order, err := server.store.CreateOrderWithTx(ctx, tx, orderArg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Create order items and update product stock
	for _, item := range cartItems {
		// Create order item
		itemArg := db.CreateOrderItemParams{
			OrderID:   order.ID,
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		}

		_, err = server.store.CreateOrderItemWithTx(ctx, tx, itemArg)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}

		// Update product stock
		stockArg := db.UpdateProductStockParams{
			ID:            item.ProductID,
			StockQuantity: -item.Quantity, // Decrease stock
		}

		_, err = server.store.UpdateProductStockWithTx(ctx, tx, stockArg)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, errorResponse(err))
			return
		}
	}

	// Clear cart
	err = server.store.ClearCartWithTx(ctx, tx, authPayload.UserID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Commit transaction
	err = tx.Commit()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Get order items for response
	orderItems, err := server.store.GetOrderItems(ctx, order.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Create response
	response := newOrderResponse(order)
	itemsResponse := make([]orderItemResponse, len(orderItems))
	for i, item := range orderItems {
		itemsResponse[i] = newOrderItemResponse(item)
	}
	response.Items = itemsResponse

	ctx.JSON(http.StatusCreated, response)
}

func (server *Server) getOrder(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	order, err := server.store.GetOrder(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("order not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check authorization
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if order.UserID != authPayload.UserID && authPayload.Role != "admin" {
		err := errors.New("you don't have permission to view this order")
		ctx.JSON(http.StatusForbidden, errorResponse(err))
		return
	}

	// Get order items
	orderItems, err := server.store.GetOrderItems(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Create response
	response := newOrderResponse(order)
	itemsResponse := make([]orderItemResponse, len(orderItems))
	for i, item := range orderItems {
		itemsResponse[i] = newOrderItemResponse(item)
	}
	response.Items = itemsResponse

	ctx.JSON(http.StatusOK, response)
}

func (server *Server) getUserOrders(ctx *gin.Context) {
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)

	orders, err := server.store.GetOrdersByUser(ctx, authPayload.UserID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]orderResponse, len(orders))
	for i, order := range orders {
		response[i] = newOrderResponse(order)
	}

	ctx.JSON(http.StatusOK, response)
}

type updateOrderStatusRequest struct {
	Status string `json:"status" binding:"required,oneof=pending processing shipped delivered cancelled"`
}

func (server *Server) updateOrderStatus(ctx *gin.Context) {
	// Only admin can update order status
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if authPayload.Role != "admin" {
		err := errors.New("only admin can update order status")
		ctx.JSON(http.StatusForbidden, errorResponse(err))
		return
	}

	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var req updateOrderStatusRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.UpdateOrderStatusParams{
		ID:     id,
		Status: db.OrderStatus(req.Status),
	}

	order, err := server.store.UpdateOrderStatus(ctx, arg)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("order not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newOrderResponse(order))
}
