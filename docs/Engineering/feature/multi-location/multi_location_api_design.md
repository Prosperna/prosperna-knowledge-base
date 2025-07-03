---
title: Multi-Location Store
sidebar_label: Multi-Location Store API Design
---
**Multi-Location Store API Design (MongoDB + API Key Auth)**

---

## 📆 Overview

Designing a secure, scalable API for a multi-location store where:

- Each store has a unique set of products, pricing, and inventory.
- Users can only interact with one store at a time.
- Orders and carts are scoped to the selected store.
- The API is protected using an API key and secret key with HMAC authentication.

---

## 📅 MongoDB Data Design

### 1. `stores` Collection

```json
{
  "_id": ObjectId,
  "name": "SM Makati",
  "location": {
    "address": "Ayala Center, Makati",
    "city": "Makati",
    "province": "Metro Manila",
    "zipcode": "1224",
    "coordinates": { "lat": 14.5534, "long": 121.0331 }
  },
  "delivery_radius_km": 10,
  "open_hours": {
    "mon": ["08:00", "20:00"],
    "tue": ["08:00", "20:00"]
  },
  "is_active": true
}
```

### 2. `products` Collection (Global Catalog)

```json
{
  "_id": ObjectId,
  "sku": "SKU-123",
  "name": "Almond Milk",
  "description": "Unsweetened 1L Almond Milk",
  "category": "Beverages",
  "image_url": "https://cdn...",
  "is_active": true
}
```

### 3. `store_products` Collection

```json
{
  "_id": ObjectId,
  "store_id": ObjectId,
  "product_id": ObjectId,
  "price": 120.00,
  "stock_quantity": 15,
  "is_available": true
}
```

### 4. `users` Collection

```json
{
  "_id": ObjectId,
  "email": "user@example.com",
  "password_hash": "...",
  "default_store_id": ObjectId
}
```

### 5. `carts` Collection

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "store_id": ObjectId,
  "status": "active",
  "items": [
    {
      "product_id": ObjectId,
      "name": "Almond Milk",
      "price": 120.00,
      "quantity": 2
    }
  ],
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### 6. `orders` Collection

```json
{
  "_id": ObjectId,
  "user_id": ObjectId,
  "store_id": ObjectId,
  "cart_id": ObjectId,
  "status": "paid",
  "total_amount": 240.00,
  "delivery_type": "delivery",
  "delivery_address": "Taguig, BGC, Tower 3",
  "items": [
    {
      "product_id": ObjectId,
      "name": "Almond Milk",
      "price": 120.00,
      "quantity": 2
    }
  ],
  "created_at": ISODate,
  "updated_at": ISODate
}
```

### 7. `api_clients` Collection (for API Key Auth)

```json
{
  "_id": ObjectId,
  "name": "Partner Storefront App",
  "api_key": "abcd1234xyz",
  "secret_key_hash": "<hashed>",
  "store_ids": [ObjectId],
  "is_active": true,
  "rate_limit_per_minute": 300,
  "last_used_at": ISODate
}
```

---

## 📊 API Endpoints

### Store Session

```http
POST /session/location
GET /session/location
```

### Stores

```http
GET /stores
GET /stores/{store_id}
```

### Products (store-scoped)

```http
GET /stores/{store_id}/products
GET /stores/{store_id}/products/{product_id}
```

### Cart

```http
GET /stores/{store_id}/cart
POST /stores/{store_id}/cart/items
PATCH /stores/{store_id}/cart/items/{item_id}
DELETE /stores/{store_id}/cart/items/{item_id}
```

### Orders

```http
POST /stores/{store_id}/orders
GET /stores/{store_id}/orders/{order_id}
```

### Fulfillment Options

```http
GET /stores/{store_id}/fulfillment-options
```

---

## 🔐 API Authentication (API Key + Secret)

### Request Headers

```http
X-Api-Key: abcd1234xyz
X-Timestamp: 2025-07-03T05:32:00Z
X-Signature: <HMAC_SHA256>
```

### HMAC Signature Generation

```js
const crypto = require('crypto');
function signRequest(method, path, body, timestamp, secretKey) {
  const payload = `${method}\n${path}\n${JSON.stringify(body)}\n${timestamp}`;
  return crypto.createHmac('sha256', secretKey).update(payload).digest('hex');
}
```

### Server-side Middleware Steps

1. Validate `X-Api-Key`
2. Check `X-Timestamp` (within 5 min)
3. Recalculate signature with `secret_key_hash`
4. Authorize `store_id` access
5. Apply rate limits per client

---

## 🚀 Enhancements

- Key rotation, expiration, and admin management
- Store-specific metrics & logging
- Postman or Swagger support for partner integration
- Token bucket or Redis-based rate limiting

---

```yaml

openapi: 3.0.3
info:
  title: Multi-Location Store API
  version: 1.0.0
  description: API secured by API Key + HMAC for multi-store product and order management.
servers:
  - url: http://localhost:3000/v1
    description: Local Development Server
  - url: https://prodev.prosperna.ph/v1
    description: Development Server
  - url: https://prostage.prosperna.ph/v1
    description: Staging Server
  - url: https://p1.prosperna.com/v1
    description: Production Server

components:
  securitySchemes:
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-Api-Key
    SignatureAuth:
      type: apiKey
      in: header
      name: X-Signature
    Timestamp:
      type: apiKey
      in: header
      name: X-Timestamp

  schemas:
    Store:
      type: object
      properties:
        _id:
          type: string
        name:
          type: string
        location:
          type: object
          properties:
            address: { type: string }
            city: { type: string }
            province: { type: string }
            zipcode: { type: string }
            coordinates:
              type: object
              properties:
                lat: { type: number }
                long: { type: number }
    Product:
      type: object
      properties:
        _id:
          type: string
        name:
          type: string
        price:
          type: number
        is_available:
          type: boolean
    CartItem:
      type: object
      properties:
        product_id:
          type: string
        name:
          type: string
        price:
          type: number
        quantity:
          type: integer
    Order:
      type: object
      properties:
        cart_id:
          type: string
        delivery_type:
          type: string
          enum: [pickup, delivery]
        delivery_address:
          type: string

security:
  - ApiKeyAuth: []
  - SignatureAuth: []
  - Timestamp: []

paths:
  /session/location:
    post:
      summary: Set active store location
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                store_id:
                  type: string
      responses:
        '200': { description: Store set }
    get:
      summary: Get active store location
      responses:
        '200':
          description: Current session store
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Store'

  /stores:
    get:
      summary: Get all stores
      responses:
        '200':
          description: List of stores
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Store'

  /stores/{store_id}:
    get:
      summary: Get store by ID
      parameters:
        - name: store_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Store data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Store'

  /stores/{store_id}/products:
    get:
      summary: Get products for a store
      parameters:
        - name: store_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: List of products
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Product'

  /stores/{store_id}/products/{product_id}:
    get:
      summary: Get specific product by ID from a store
      parameters:
        - name: store_id
          in: path
          required: true
          schema:
            type: string
        - name: product_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Product data
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Product'

  /stores/{store_id}/cart:
    get:
      summary: Get current cart
      parameters:
        - name: store_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Cart items
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/CartItem'

  /stores/{store_id}/cart/items:
    post:
      summary: Add item to cart
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CartItem'
      responses:
        '201': { description: Item added }

  /stores/{store_id}/cart/items/{item_id}:
    patch:
      summary: Update cart item
      parameters:
        - name: item_id
          in: path
          required: true
          schema:
            type: string
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              properties:
                quantity:
                  type: integer
      responses:
        '200': { description: Updated }
    delete:
      summary: Remove cart item
      parameters:
        - name: item_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '204': { description: Deleted }

  /stores/{store_id}/orders:
    post:
      summary: Place an order
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Order'
      responses:
        '201': { description: Order placed }

  /stores/{store_id}/orders/{order_id}:
    get:
      summary: Get order by ID
      parameters:
        - name: order_id
          in: path
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Order details
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/Order'

  /stores/{store_id}/fulfillment-options:
    get:
      summary: Get fulfillment options per store
      responses:
        '200':
          description: Options available
          content:
            application/json:
              schema:
                type: object
                properties:
                  pickup:
                    type: boolean
                  delivery:
                    type: boolean
                  delivery_radius_km:
                    type: number
```

