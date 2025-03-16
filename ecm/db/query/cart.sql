-- name: AddToCart :one
INSERT INTO cart_items (user_id, product_id, quantity)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, product_id) 
DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()
RETURNING *;

-- name: UpdateCartQuantity :one
UPDATE cart_items
SET quantity = $3, updated_at = NOW()
WHERE user_id = $1 AND product_id = $2
RETURNING *;

-- name: RemoveFromCart :exec
DELETE FROM cart_items
WHERE user_id = $1 AND product_id = $2;

-- name: GetCartItems :many
SELECT c.*, p.name as product_name, p.price, p.image_url
FROM cart_items c
JOIN products p ON c.product_id = p.id
WHERE c.user_id = $1;

-- name: ClearCart :exec
DELETE FROM cart_items
WHERE user_id = $1;
