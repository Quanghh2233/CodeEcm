// Code generated by sqlc. DO NOT EDIT.
// versions:
//   sqlc v1.28.0
// source: products.sql

package db

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

const createProduct = `-- name: CreateProduct :one
INSERT INTO products (name, description, price, stock_quantity, shop_id, category_id, image_url)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING id, name, description, price, stock_quantity, shop_id, category_id, image_url, created_at, updated_at
`

type CreateProductParams struct {
	Name          string         `json:"name"`
	Description   sql.NullString `json:"description"`
	Price         string         `json:"price"`
	StockQuantity int32          `json:"stock_quantity"`
	ShopID        uuid.UUID      `json:"shop_id"`
	CategoryID    uuid.UUID      `json:"category_id"`
	ImageUrl      sql.NullString `json:"image_url"`
}

func (q *Queries) CreateProduct(ctx context.Context, arg CreateProductParams) (Product, error) {
	row := q.db.QueryRowContext(ctx, createProduct,
		arg.Name,
		arg.Description,
		arg.Price,
		arg.StockQuantity,
		arg.ShopID,
		arg.CategoryID,
		arg.ImageUrl,
	)
	var i Product
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.Price,
		&i.StockQuantity,
		&i.ShopID,
		&i.CategoryID,
		&i.ImageUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const deleteProduct = `-- name: DeleteProduct :exec
DELETE FROM products
WHERE id = $1
`

func (q *Queries) DeleteProduct(ctx context.Context, id uuid.UUID) error {
	_, err := q.db.ExecContext(ctx, deleteProduct, id)
	return err
}

const getProduct = `-- name: GetProduct :one
SELECT id, name, description, price, stock_quantity, shop_id, category_id, image_url, created_at, updated_at FROM products
WHERE id = $1
`

func (q *Queries) GetProduct(ctx context.Context, id uuid.UUID) (Product, error) {
	row := q.db.QueryRowContext(ctx, getProduct, id)
	var i Product
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.Price,
		&i.StockQuantity,
		&i.ShopID,
		&i.CategoryID,
		&i.ImageUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const listProducts = `-- name: ListProducts :many
SELECT id, name, description, price, stock_quantity, shop_id, category_id, image_url, created_at, updated_at FROM products
ORDER BY created_at
LIMIT $1 OFFSET $2
`

type ListProductsParams struct {
	Limit  int32 `json:"limit"`
	Offset int32 `json:"offset"`
}

func (q *Queries) ListProducts(ctx context.Context, arg ListProductsParams) ([]Product, error) {
	rows, err := q.db.QueryContext(ctx, listProducts, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Product{}
	for rows.Next() {
		var i Product
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.Price,
			&i.StockQuantity,
			&i.ShopID,
			&i.CategoryID,
			&i.ImageUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listProductsByCategory = `-- name: ListProductsByCategory :many
SELECT id, name, description, price, stock_quantity, shop_id, category_id, image_url, created_at, updated_at FROM products
WHERE category_id = $1
ORDER BY created_at
LIMIT $2 OFFSET $3
`

type ListProductsByCategoryParams struct {
	CategoryID uuid.UUID `json:"category_id"`
	Limit      int32     `json:"limit"`
	Offset     int32     `json:"offset"`
}

func (q *Queries) ListProductsByCategory(ctx context.Context, arg ListProductsByCategoryParams) ([]Product, error) {
	rows, err := q.db.QueryContext(ctx, listProductsByCategory, arg.CategoryID, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Product{}
	for rows.Next() {
		var i Product
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.Price,
			&i.StockQuantity,
			&i.ShopID,
			&i.CategoryID,
			&i.ImageUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const listProductsByShop = `-- name: ListProductsByShop :many
SELECT id, name, description, price, stock_quantity, shop_id, category_id, image_url, created_at, updated_at FROM products
WHERE shop_id = $1
ORDER BY created_at
`

func (q *Queries) ListProductsByShop(ctx context.Context, shopID uuid.UUID) ([]Product, error) {
	rows, err := q.db.QueryContext(ctx, listProductsByShop, shopID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Product{}
	for rows.Next() {
		var i Product
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.Price,
			&i.StockQuantity,
			&i.ShopID,
			&i.CategoryID,
			&i.ImageUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const searchProducts = `-- name: SearchProducts :many
SELECT id, name, description, price, stock_quantity, shop_id, category_id, image_url, created_at, updated_at FROM products
WHERE name ILIKE $1 OR description ILIKE $1
ORDER BY created_at
LIMIT $2 OFFSET $3
`

type SearchProductsParams struct {
	Name   string `json:"name"`
	Limit  int32  `json:"limit"`
	Offset int32  `json:"offset"`
}

func (q *Queries) SearchProducts(ctx context.Context, arg SearchProductsParams) ([]Product, error) {
	rows, err := q.db.QueryContext(ctx, searchProducts, arg.Name, arg.Limit, arg.Offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	items := []Product{}
	for rows.Next() {
		var i Product
		if err := rows.Scan(
			&i.ID,
			&i.Name,
			&i.Description,
			&i.Price,
			&i.StockQuantity,
			&i.ShopID,
			&i.CategoryID,
			&i.ImageUrl,
			&i.CreatedAt,
			&i.UpdatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, i)
	}
	if err := rows.Close(); err != nil {
		return nil, err
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}
	return items, nil
}

const updateProduct = `-- name: UpdateProduct :one
UPDATE products
SET 
  name = $2,
  description = $3,
  price = $4,
  stock_quantity = $5,
  category_id = $6,
  image_url = $7,
  updated_at = NOW()
WHERE id = $1
RETURNING id, name, description, price, stock_quantity, shop_id, category_id, image_url, created_at, updated_at
`

type UpdateProductParams struct {
	ID            uuid.UUID      `json:"id"`
	Name          string         `json:"name"`
	Description   sql.NullString `json:"description"`
	Price         string         `json:"price"`
	StockQuantity int32          `json:"stock_quantity"`
	CategoryID    uuid.UUID      `json:"category_id"`
	ImageUrl      sql.NullString `json:"image_url"`
}

func (q *Queries) UpdateProduct(ctx context.Context, arg UpdateProductParams) (Product, error) {
	row := q.db.QueryRowContext(ctx, updateProduct,
		arg.ID,
		arg.Name,
		arg.Description,
		arg.Price,
		arg.StockQuantity,
		arg.CategoryID,
		arg.ImageUrl,
	)
	var i Product
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.Price,
		&i.StockQuantity,
		&i.ShopID,
		&i.CategoryID,
		&i.ImageUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}

const updateProductStock = `-- name: UpdateProductStock :one
UPDATE products
SET stock_quantity = stock_quantity + $2, updated_at = NOW()
WHERE id = $1
RETURNING id, name, description, price, stock_quantity, shop_id, category_id, image_url, created_at, updated_at
`

type UpdateProductStockParams struct {
	ID            uuid.UUID `json:"id"`
	StockQuantity int32     `json:"stock_quantity"`
}

func (q *Queries) UpdateProductStock(ctx context.Context, arg UpdateProductStockParams) (Product, error) {
	row := q.db.QueryRowContext(ctx, updateProductStock, arg.ID, arg.StockQuantity)
	var i Product
	err := row.Scan(
		&i.ID,
		&i.Name,
		&i.Description,
		&i.Price,
		&i.StockQuantity,
		&i.ShopID,
		&i.CategoryID,
		&i.ImageUrl,
		&i.CreatedAt,
		&i.UpdatedAt,
	)
	return i, err
}
