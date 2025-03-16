# ECM - E-Commerce Platform

A modern e-commerce platform built with Go, React, PostgreSQL, and Docker.

## Features

- Authentication with JWT
- Role-based access control (Admin, Seller, Buyer)
- Product management
- Shopping cart functionality
- Order processing
- Category management
- Shop management for sellers

## Tech Stack

- **Backend**: Go with Gin framework
- **Frontend**: React with TypeScript and Material-UI
- **Database**: PostgreSQL
- **Containerization**: Docker
- **API Documentation**: Swagger/OpenAPI

## Prerequisites

- Go 1.21 or higher
- Node.js 16 or higher
- Docker and Docker Compose
- PostgreSQL 14 or higher

## Getting Started

### Setup Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration.

### Run with Docker

```bash
make docker-up
```

This will start the PostgreSQL database, backend API, and frontend in Docker containers.

### Run Locally for Development

1. Start PostgreSQL:

```bash
make postgres
```

2. Create the database:

```bash
make create-db
```

3. Run migrations:

```bash
make migrate-up
```

4. Start the backend:

```bash
make server
```

5. Start the frontend (in a separate terminal):

```bash
make start-frontend
```

### Database Operations

- Create database: `make create-db`
- Drop database: `make drop-db`
- Run migrations up: `make migrate-up`
- Run migrations down: `make migrate-down`
- Generate SQL queries: `make sqlc`

## Project Structure

- `/api` - API handlers and routes
- `/cmd` - Application commands and entry points
- `/db` - Database migration files and generated query code
- `/frontend` - React frontend application
- `/token` - JWT token implementation
- `/util` - Utility functions

## API Documentation

### Authentication & User Routes

#### Register New User
- **Method**: POST
- **Endpoint**: `/users`
- **Auth Required**: No
- **Request Body**:
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### User Login
- **Method**: POST
- **Endpoint**: `/users/login`
- **Auth Required**: No
- **Request Body**:
```json
{
  "username": "johndoe",
  "password": "password123"
}
```

#### Get Current User
- **Method**: GET
- **Endpoint**: `/users/me`
- **Auth Required**: Yes

#### Update User Role
- **Method**: PATCH
- **Endpoint**: `/users/role`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "role": "seller"
}
```

### Category Routes

#### Create Category (Admin only)
- **Method**: POST
- **Endpoint**: `/categories`
- **Auth Required**: Yes (Admin)
- **Request Body**:
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

#### Get All Categories
- **Method**: GET
- **Endpoint**: `/categories`
- **Auth Required**: No

#### Get Category by ID
- **Method**: GET
- **Endpoint**: `/categories/:id`
- **Auth Required**: No

#### Update Category (Admin only)
- **Method**: PUT
- **Endpoint**: `/categories/:id`
- **Auth Required**: Yes (Admin)
- **Request Body**:
```json
{
  "name": "Electronics",
  "description": "Updated electronics category description"
}
```

#### Delete Category (Admin only)
- **Method**: DELETE
- **Endpoint**: `/categories/:id`
- **Auth Required**: Yes (Admin)

### Shop Routes

#### Create Shop
- **Method**: POST
- **Endpoint**: `/shops`
- **Auth Required**: Yes (Seller or Admin)
- **Request Body**:
```json
{
  "name": "My Tech Store",
  "description": "Selling quality tech products"
}
```

#### Get Shop by ID
- **Method**: GET
- **Endpoint**: `/shops/:id`
- **Auth Required**: Yes

#### Get All Shops (for owner or admin)
- **Method**: GET
- **Endpoint**: `/shops`
- **Auth Required**: Yes

#### Update Shop
- **Method**: PUT
- **Endpoint**: `/shops/:id`
- **Auth Required**: Yes (Owner or Admin)
- **Request Body**:
```json
{
  "name": "Updated Shop Name",
  "description": "Updated shop description"
}
```

#### Delete Shop
- **Method**: DELETE
- **Endpoint**: `/shops/:id`
- **Auth Required**: Yes (Owner or Admin)

### Product Routes

#### Create Product
- **Method**: POST
- **Endpoint**: `/products`
- **Auth Required**: Yes (Shop owner or Admin)
- **Request Body**:
```json
{
  "name": "Smartphone X",
  "description": "Latest smartphone with amazing features",
  "price": 999.99,
  "stock_quantity": 50,
  "shop_id": "shop-uuid-here",
  "category_id": "category-uuid-here",
  "image_url": "https://example.com/image.jpg"
}
```

#### Get Product by ID
- **Method**: GET
- **Endpoint**: `/products/:id`
- **Auth Required**: No

#### List All Products (paginated)
- **Method**: GET
- **Endpoint**: `/products?page_id=1&page_size=10`
- **Auth Required**: No

#### List Products by Category (paginated)
- **Method**: GET
- **Endpoint**: `/categories/:id/products?page_id=1&page_size=10`
- **Auth Required**: No

#### List Products by Shop
- **Method**: GET
- **Endpoint**: `/shops/:id/products`
- **Auth Required**: Yes (Shop owner or Admin)

#### Search Products
- **Method**: GET
- **Endpoint**: `/products/search?query=keyword&page_id=1&page_size=10`
- **Auth Required**: No

#### Update Product
- **Method**: PUT
- **Endpoint**: `/products/:id`
- **Auth Required**: Yes (Shop owner or Admin)
- **Request Body**:
```json
{
  "name": "Updated Smartphone X",
  "description": "Updated description",
  "price": 899.99,
  "stock_quantity": 45,
  "category_id": "category-uuid-here",
  "image_url": "https://example.com/updated-image.jpg"
}
```

#### Delete Product
- **Method**: DELETE
- **Endpoint**: `/products/:id`
- **Auth Required**: Yes (Shop owner or Admin)

### Cart Routes

#### Get Cart Items
- **Method**: GET
- **Endpoint**: `/cart`
- **Auth Required**: Yes

#### Add to Cart
- **Method**: POST
- **Endpoint**: `/cart`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "product_id": "product-uuid-here",
  "quantity": 2
}
```

#### Update Cart Item Quantity
- **Method**: PUT
- **Endpoint**: `/cart`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "product_id": "product-uuid-here",
  "quantity": 3
}
```

#### Remove Item from Cart
- **Method**: DELETE
- **Endpoint**: `/cart/:productId`
- **Auth Required**: Yes

#### Clear Cart
- **Method**: DELETE
- **Endpoint**: `/cart`
- **Auth Required**: Yes

### Order Routes

#### Create Order
- **Method**: POST
- **Endpoint**: `/orders`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "shipping_address": "123 Main St, City, Country",
  "payment_method": "credit_card"
}
```

#### Get User's Orders
- **Method**: GET
- **Endpoint**: `/orders`
- **Auth Required**: Yes

#### Get Order by ID
- **Method**: GET
- **Endpoint**: `/orders/:id`
- **Auth Required**: Yes (Order owner or Admin)

#### Update Order Status (Admin only)
- **Method**: PATCH
- **Endpoint**: `/orders/:id/status`
- **Auth Required**: Yes (Admin)
- **Request Body**:
```json
{
  "status": "shipped"
}
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
