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

type createProductRequest struct {
	Name          string  `json:"name" binding:"required"`
	Description   string  `json:"description"`
	Price         float64 `json:"price" binding:"required,gt=0"`
	StockQuantity int32   `json:"stock_quantity" binding:"required,gte=0"`
	ShopID        string  `json:"shop_id" binding:"required"`
	CategoryID    string  `json:"category_id" binding:"required"`
	ImageURL      string  `json:"image_url"`
}

type productResponse struct {
	ID            uuid.UUID `json:"id"`
	Name          string    `json:"name"`
	Description   string    `json:"description"`
	Price         float64   `json:"price"`
	StockQuantity int32     `json:"stock_quantity"`
	ShopID        uuid.UUID `json:"shop_id"`
	CategoryID    uuid.UUID `json:"category_id"`
	ImageURL      string    `json:"image_url"`
	CreatedAt     string    `json:"created_at"`
	UpdatedAt     string    `json:"updated_at"`
}

func newProductResponse(product db.Product) productResponse {
	price, err := strconv.ParseFloat(product.Price, 64)
	if err != nil {
		price = 0.0
	}
	return productResponse{
		ID:            product.ID,
		Name:          product.Name,
		Description:   product.Description.String,
		Price:         price,
		StockQuantity: product.StockQuantity,
		ShopID:        product.ShopID,
		CategoryID:    product.CategoryID,
		ImageURL:      product.ImageUrl.String,
		CreatedAt:     product.CreatedAt.String(),
		UpdatedAt:     product.UpdatedAt.String(),
	}
}

func (server *Server) createProduct(ctx *gin.Context) {
	var req createProductRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	shopID, err := uuid.Parse(req.ShopID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Verify shop exists
	shop, err := server.store.GetShop(ctx, shopID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("shop not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check if user is authorized to add products to this shop
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if shop.OwnerID != authPayload.UserID && authPayload.Role != "admin" {
		err := errors.New("you don't have permission to add products to this shop")
		ctx.JSON(http.StatusForbidden, errorResponse(err))
		return
	}

	// Verify category exists
	_, err = server.store.GetCategory(ctx, categoryID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("category not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	arg := db.CreateProductParams{
		Name:          req.Name,
		Description:   sql.NullString{String: req.Description, Valid: req.Description != ""},
		Price:         strconv.FormatFloat(req.Price, 'f', -1, 64),
		StockQuantity: req.StockQuantity,
		ShopID:        shopID,
		CategoryID:    categoryID,
		ImageUrl:      sql.NullString{String: req.ImageURL, Valid: req.ImageURL != ""},
	}

	product, err := server.store.CreateProduct(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusCreated, newProductResponse(product))
}

func (server *Server) getProduct(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	product, err := server.store.GetProduct(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("product not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newProductResponse(product))
}

type listProductsRequest struct {
	PageID   int32 `form:"page_id" binding:"required,min=1"`
	PageSize int32 `form:"page_size" binding:"required,min=5,max=10"`
}

func (server *Server) listProducts(ctx *gin.Context) {
	var req listProductsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.ListProductsParams{
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	}

	products, err := server.store.ListProducts(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]productResponse, len(products))
	for i, product := range products {
		response[i] = newProductResponse(product)
	}
	ctx.JSON(http.StatusOK, response)
}

func (server *Server) listProductsByCategory(ctx *gin.Context) {
	categoryID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var req listProductsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.ListProductsByCategoryParams{
		CategoryID: categoryID,
		Limit:      req.PageSize,
		Offset:     (req.PageID - 1) * req.PageSize,
	}

	products, err := server.store.ListProductsByCategory(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]productResponse, len(products))
	for i, product := range products {
		response[i] = newProductResponse(product)
	}
	ctx.JSON(http.StatusOK, response)
}

func (server *Server) searchProducts(ctx *gin.Context) {
	query := ctx.Query("query")
	if query == "" {
		ctx.JSON(http.StatusBadRequest, errorResponse(errors.New("search query is required")))
		return
	}

	var req listProductsRequest
	if err := ctx.ShouldBindQuery(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	arg := db.SearchProductsParams{
		Name:   "%" + query + "%",
		Limit:  req.PageSize,
		Offset: (req.PageID - 1) * req.PageSize,
	}

	products, err := server.store.SearchProducts(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]productResponse, len(products))
	for i, product := range products {
		response[i] = newProductResponse(product)
	}
	ctx.JSON(http.StatusOK, response)
}

type updateProductRequest struct {
	Name          string  `json:"name" binding:"required"`
	Description   string  `json:"description"`
	Price         float64 `json:"price" binding:"required,gt=0"`
	StockQuantity int32   `json:"stock_quantity" binding:"required,gte=0"`
	CategoryID    string  `json:"category_id" binding:"required"`
	ImageURL      string  `json:"image_url"`
}

func (server *Server) updateProduct(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	var req updateProductRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	categoryID, err := uuid.Parse(req.CategoryID)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get the product to check shop ownership
	product, err := server.store.GetProduct(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("product not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Get the shop to check ownership
	shop, err := server.store.GetShop(ctx, product.ShopID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check authorization
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if shop.OwnerID != authPayload.UserID && authPayload.Role != "admin" {
		err := errors.New("you don't have permission to update this product")
		ctx.JSON(http.StatusForbidden, errorResponse(err))
		return
	}

	// Verify category exists
	_, err = server.store.GetCategory(ctx, categoryID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("category not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	arg := db.UpdateProductParams{
		ID:            id,
		Name:          req.Name,
		Description:   sql.NullString{String: req.Description, Valid: req.Description != ""},
		Price:         strconv.FormatFloat(req.Price, 'f', -1, 64),
		StockQuantity: req.StockQuantity,
		CategoryID:    categoryID,
		ImageUrl:      sql.NullString{String: req.ImageURL, Valid: req.ImageURL != ""},
	}

	updatedProduct, err := server.store.UpdateProduct(ctx, arg)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, newProductResponse(updatedProduct))
}

func (server *Server) deleteProduct(ctx *gin.Context) {
	id, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Get the product to check shop ownership
	product, err := server.store.GetProduct(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("product not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Get the shop to check ownership
	shop, err := server.store.GetShop(ctx, product.ShopID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check authorization
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if shop.OwnerID != authPayload.UserID && authPayload.Role != "admin" {
		err := errors.New("you don't have permission to delete this product")
		ctx.JSON(http.StatusForbidden, errorResponse(err))
		return
	}

	err = server.store.DeleteProduct(ctx, id)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "product deleted successfully"})
}

func (server *Server) listProductsByShop(ctx *gin.Context) {
	shopID, err := uuid.Parse(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, errorResponse(err))
		return
	}

	// Verify shop exists
	shop, err := server.store.GetShop(ctx, shopID)
	if err != nil {
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusNotFound, errorResponse(errors.New("shop not found")))
			return
		}
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	// Check if user is authorized to view shop products
	authPayload := ctx.MustGet(authorizationPayloadKey).(*token.Payload)
	if shop.OwnerID != authPayload.UserID && authPayload.Role != "admin" {
		// For normal users, we could filter only published products
		// For now, we'll restrict to shop owner or admin
		err := errors.New("you don't have permission to view these products")
		ctx.JSON(http.StatusForbidden, errorResponse(err))
		return
	}

	products, err := server.store.ListProductsByShop(ctx, shopID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, errorResponse(err))
		return
	}

	response := make([]productResponse, len(products))
	for i, product := range products {
		response[i] = newProductResponse(product)
	}
	ctx.JSON(http.StatusOK, response)
}
