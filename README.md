# Khula Supplier API

RESTful NestJS backend for agri-dealers to manage inventory and process farmer orders with dynamic pricing, supplier matching, stock reservation, backordering, and fulfillment tracking.

## Quick start

```bash
adjust .env configs to point to local mysqldb
npm install
npm run start:dev
```

Swagger is available at `http://localhost:3000/docs`.

All write endpoints are protected by `x-api-key`; use the value in `.env`.

## Endpoints

- `POST /dealers` - register an agri-dealer with location and optional inventory
- `POST /products` - create products with quantity pricing tiers
- `POST /orders` - place a farmer order and reserve stock
- `GET /orders/:id` - view order status and assigned dealer
- `PATCH /orders/:id/status` - update fulfillment status

## Matching rules

The order matcher first filters dealers that can fulfill every requested item. It then ranks by:

1. Lowest total tiered price
2. Shortest Haversine distance from farmer location
3. Dealer ranking, based on fulfillment performance and stock freshness

If no single dealer can fulfill the order, the API creates a backordered order with partial allocations from available dealers and records the remaining quantities.
