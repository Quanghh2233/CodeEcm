-- name: CreateOrder :one
INSERT INTO orders (user_id, total_amount, shipping_address, payment_method)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: CreateOrderItem :one
INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: GetOrder :one
SELECT * FROM orders
WHERE id = $1;

-- name: GetOrdersByUser :many
SELECT * FROM orders
WHERE user_id = $1
ORDER BY created_at DESC;

-- name: GetOrderItems :many
SELECT oi.*, p.name as product_name, p.image_url
FROM order_items oi
JOIN products p ON oi.product_id = p.id
WHERE oi.order_id = $1;

-- name: UpdateOrderStatus :one
UPDATE orders
SET status = $2, updated_at = NOW()
WHERE id = $1
RETURNING *;
