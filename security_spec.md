# Security Specification: Flavista (Zero-Trust Firestore Guard)

## 1. Data Invariants

1. **Orders**:
   - An order cannot have a missing or malformed unique identifier (`id`).
   - The status of a newly created order must be strictly set to `'new'`.
   - The order `restaurantId` must always be `'flavista'`.
   - Modifying an order is restricted: customers cannot modify an order once placed. Admins can update the `status` field to transitions like `'preparing'`, `'ready'`, `'completed'`, or `'cancelled'`.
   - Once an order reaches a terminal state (`completed` or `cancelled`), it cannot be updated further.
   - Every text field (`customerName`, `customerPhone`, `orderNumber`) must have safe length boundaries (e.g., <= 100 characters).

2. **Notifications**:
   - Notifications must have a status matching the referenced order.
   - The `restaurantId` must always be `'flavista'`.
   - Read status (`isRead`) can only be modified by administrative/authorized actions.

3. **Delivery Areas**:
   - Areas are reference configurations.
   - Modifying, creating, or deleting delivery areas requires admin rights.
   - The fee must be a non-negative number.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following malicious payloads must be rejected (`PERMISSION_DENIED`) by the Firestore security rules:

### Payload 1: Order with Missing ID
```json
{
  "orderNumber": "1",
  "customerName": "Kamal",
  "customerPhone": "0550123456",
  "deliveryType": "delivery",
  "status": "new",
  "total": 1200,
  "createdAt": "2026-06-24T09:43:29.000Z",
  "items": [],
  "restaurantId": "flavista"
}
```

### Payload 2: Order with Non-'new' Status on Creation
```json
{
  "id": "order-123",
  "orderNumber": "1",
  "customerName": "Kamal",
  "customerPhone": "0550123456",
  "deliveryType": "delivery",
  "status": "completed",
  "total": 1200,
  "createdAt": "2026-06-24T09:43:29.000Z",
  "items": [],
  "restaurantId": "flavista"
}
```

### Payload 3: Order with Poisoned Huge Name (Denial of Wallet)
```json
{
  "id": "order-123",
  "orderNumber": "1",
  "customerName": "Kamal...[1MB of random characters]...",
  "customerPhone": "0550123456",
  "deliveryType": "delivery",
  "status": "new",
  "total": 1200,
  "createdAt": "2026-06-24T09:43:29.000Z",
  "items": [],
  "restaurantId": "flavista"
}
```

### Payload 4: Order with Invalid/Foreign Restaurant ID
```json
{
  "id": "order-123",
  "orderNumber": "1",
  "customerName": "Kamal",
  "customerPhone": "0550123456",
  "deliveryType": "delivery",
  "status": "new",
  "total": 1200,
  "createdAt": "2026-06-24T09:43:29.000Z",
  "items": [],
  "restaurantId": "malicious_restaurant_id"
}
```

### Payload 5: Sibling Notification Creation Hijack (Spoofing)
```json
{
  "id": "notif-123",
  "orderId": "order-123",
  "orderNumber": "1",
  "customerName": "Kamal",
  "deliveryType": "delivery",
  "createdAt": "2026-06-24T09:43:29.000Z",
  "orderStatus": "completed",
  "isRead": true,
  "restaurantId": "flavista"
}
```

### Payload 6: Malicious Delivery Area injection (Fee bypass)
```json
{
  "id": "area-poison",
  "name": "Free Delivery everywhere",
  "fee": -100,
  "isActive": true,
  "neighborhoods": "All",
  "restaurantId": "flavista"
}
```

### Payload 7: Shadow Update on Order (Ghost Fields)
```json
{
  "id": "order-123",
  "orderNumber": "1",
  "customerName": "Kamal",
  "customerPhone": "0550123456",
  "deliveryType": "delivery",
  "status": "new",
  "total": 1200,
  "createdAt": "2026-06-24T09:43:29.000Z",
  "items": [],
  "restaurantId": "flavista",
  "ghostField": "malicious_data"
}
```

### Payload 8: Arbitrary Order Deletion by Customer
```json
DELETE /orders/order-123 (from unauthenticated customer client)
```

### Payload 9: Arbitrary Order Modification by Customer
```json
UPDATE /orders/order-123 with { "total": 0 }
```

### Payload 10: Invalid Type injection in order total
```json
{
  "id": "order-123",
  "orderNumber": "1",
  "customerName": "Kamal",
  "customerPhone": "0550123456",
  "deliveryType": "delivery",
  "status": "new",
  "total": "one-thousand-dinars",
  "createdAt": "2026-06-24T09:43:29.000Z",
  "items": [],
  "restaurantId": "flavista"
}
```

### Payload 11: Notification Deletion by Customer
```json
DELETE /notifications/notif-123 (from unauthenticated customer client)
```

### Payload 12: Notification Status Bypass
```json
{
  "id": "notif-123",
  "orderId": "order-123",
  "orderNumber": "1",
  "customerName": "Kamal",
  "deliveryType": "delivery",
  "createdAt": "2026-06-24T09:43:29.000Z",
  "orderStatus": "non_existent_status",
  "isRead": false,
  "restaurantId": "flavista"
}
```
