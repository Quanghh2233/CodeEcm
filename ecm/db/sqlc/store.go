package db

import (
	"context"
	"database/sql"

	"github.com/google/uuid"
)

// Store provides all functions to execute db queries and transactions
type Store interface {
	Querier
	BeginTx(ctx context.Context) (*sql.Tx, error)
	CreateOrderWithTx(ctx context.Context, tx *sql.Tx, arg CreateOrderParams) (Order, error)
	CreateOrderItemWithTx(ctx context.Context, tx *sql.Tx, arg CreateOrderItemParams) (OrderItem, error)
	UpdateProductStockWithTx(ctx context.Context, tx *sql.Tx, arg UpdateProductStockParams) (Product, error)
	ClearCartWithTx(ctx context.Context, tx *sql.Tx, userID interface{}) error
}

// SQLStore provides all functions to execute SQL queries and transactions
type SQLStore struct {
	db *sql.DB
	*Queries
}

// NewStore creates a new Store
func NewStore(db *sql.DB) Store {
	return &SQLStore{
		db:      db,
		Queries: New(db),
	}
}

// BeginTx begins a transaction
func (store *SQLStore) BeginTx(ctx context.Context) (*sql.Tx, error) {
	return store.db.BeginTx(ctx, nil)
}

// CreateOrderWithTx creates an order with transaction
func (store *SQLStore) CreateOrderWithTx(ctx context.Context, tx *sql.Tx, arg CreateOrderParams) (Order, error) {
	q := New(tx)
	return q.CreateOrder(ctx, arg)
}

// CreateOrderItemWithTx creates an order item with transaction
func (store *SQLStore) CreateOrderItemWithTx(ctx context.Context, tx *sql.Tx, arg CreateOrderItemParams) (OrderItem, error) {
	q := New(tx)
	return q.CreateOrderItem(ctx, arg)
}

// UpdateProductStockWithTx updates product stock with transaction
func (store *SQLStore) UpdateProductStockWithTx(ctx context.Context, tx *sql.Tx, arg UpdateProductStockParams) (Product, error) {
	q := New(tx)
	return q.UpdateProductStock(ctx, arg)
}

// ClearCartWithTx clears cart with transaction
func (store *SQLStore) ClearCartWithTx(ctx context.Context, tx *sql.Tx, userID interface{}) error {
	q := New(tx)
	return q.ClearCart(ctx, userID.(uuid.UUID))
}
