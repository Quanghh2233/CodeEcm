-- name: CreateShop :one
INSERT INTO shops (name, description, owner_id)
VALUES ($1, $2, $3)
RETURNING *;

-- name: GetShop :one
SELECT * FROM shops
WHERE id = $1;

-- name: ListShops :many
SELECT * FROM shops
ORDER BY created_at
LIMIT $1 OFFSET $2;

-- name: ListShopsByOwner :many
SELECT * FROM shops
WHERE owner_id = $1
ORDER BY created_at;

-- name: UpdateShop :one
UPDATE shops
SET 
  name = $2,
  description = $3,
  updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: DeleteShop :exec
DELETE FROM shops
WHERE id = $1;
