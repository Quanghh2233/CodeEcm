-- name: CreateProduct :one
INSERT INTO products (name, description, price, stock_quantity, shop_id, category_id, image_url)
VALUES ($1, $2, $3, $4, $5, $6, $7)
RETURNING *;

-- name: GetProduct :one
SELECT * FROM products
WHERE id = $1;

-- name: ListProducts :many
SELECT * FROM products
ORDER BY created_at
LIMIT $1 OFFSET $2;

-- name: ListProductsByShop :many
SELECT * FROM products
WHERE shop_id = $1
ORDER BY created_at;

-- name: ListProductsByCategory :many
SELECT * FROM products
WHERE category_id = $1
ORDER BY created_at
LIMIT $2 OFFSET $3;

-- name: SearchProducts :many
SELECT * FROM products
WHERE name ILIKE $1 OR description ILIKE $1
ORDER BY created_at
LIMIT $2 OFFSET $3;

-- name: UpdateProduct :one
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
RETURNING *;

-- name: DeleteProduct :exec
DELETE FROM products
WHERE id = $1;

-- name: UpdateProductStock :one
UPDATE products
SET stock_quantity = stock_quantity + $2, updated_at = NOW()
WHERE id = $1
RETURNING *;
