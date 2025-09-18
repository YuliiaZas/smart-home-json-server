# Custom Smart Home API

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the server:

   ```bash
   npm start
   ```

   The API will be available at: [http://localhost:3004](http://localhost:3004)

## Data Customization

- The backend uses **initial data created from templates** stored in `*.db.json` files.
- All in-memory changes (e.g., via PATCH/POST/DELETE) will be lost after restarting the server.

## Postman Collection

Import the Postman collection to explore and test API endpoints:

**[Smart Home UI Postman Collection](./smart-home-ui.postman_collection.json)**

## Available API Endpoints

### Authentication


> #### **Endpoint:** `POST /api/user/register`

Register a new user, create user-specific default dashboards from template, save user-specific values for items (sensors, devices), log in with provided credentials and receive a token.

Attempting to register user with already taken `userName` will return `409 Conflict`.

**Request body:**

```json
{
  "userName": "string",
  "password": "string",
  "fullName": "string"
}
```
`fullName` field is optional.

**Response:**

```json
{
  "token": "string"
}
```

---
> #### **Endpoint:** `POST /api/user/login`

Log in with user credentials and receive a token.

**Request body:**

```json
{
  "userName": "string",
  "password": "string"
}
```

**Response:**

```json
{
  "token": "string"
}
```

---
> #### **Endpoint:** `GET /api/user/profile`

Retrieve current user profile.

Requires `Authorization: Bearer <token>` header.

**Response:**

```json
{
  "fullName": "string",
  "initials": "string"
}
```

---

### Dashboards

> #### **Endpoint:** `GET /api/dashboards`

Get list of available dashboards.

Requires `Authorization: Bearer <token>` header.

**Response:**

```json
[
  { "id": "overview", "title": "Overview", "icon": "home" },
  { "id": "electricity", "title": "Electricity", "icon": "bolt" }
]
```

---
> #### **Endpoint:** `POST /api/dashboards`

Create a new dashboard.

Requires `Authorization: Bearer <token>` header.

**Request body:**

```json
{
  "title": "Climate",
  "icon": "device_thermostat"
}
```

All fields are required and must be non-empty strings.

**Response:**

```json
{
  "id": "unique-dashboard-id",
  "ownerUserId": "user-id",
  "title": "Climate",
  "icon": "device_thermostat",
}
```

---
> #### **Endpoint:** `GET /api/dashboards/:dashboardId`

Get tabs and cards for a specific dashboard.

Requires `Authorization: Bearer <token>` header.

**Response:**

```json
{
  "id": "unique-dashboard-id",
  "ownerUserId": "user-id",
  "title": "Overview",
  "icon": "device_thermostat",
  "tabs": [
    {
      "id": "overview",
      "title": "Overview",
      "cards": [
        {
          "id": "living-room-mixed",
          "title": "Living Room",
          "layout": "verticalLayout",
          "items": [
            {
              "type": "device",
              "icon": "lightbulb",
              "label": "Lamp",
              "state": true
            },
            {
              "type": "sensor",
              "icon": "thermostat",
              "label": "Temperature",
              "value": { "amount": 23.5, "unit": "°C" }
            }
          ]
        }
      ]
    }
  ]
}
```

---
> #### **Endpoint:** `PATCH /api/dashboards/:dashboardId`

Update the contents of an existing dashboard and user items (sensors and devices).

Requires `Authorization: Bearer <token>` header.

**Request body:**

```json
{
  "title": "Climate",
  "icon": "device_thermostat",
  "tabs": [
    {
      "id": "main",
      "title": "Main",
      "cards": [
        {
          "id": "living-room",
          "title": "Living Room",
          "layout": "verticalLayout",
          "items": [
            {
              "type": "device",
              "icon": "lightbulb",
              "label": "Lamp",
              "state": true
            },
            {
              "type": "sensor",
              "icon": "thermostat",
              "label": "Temperature",
              "value": {
                "amount": 23.5,
                "unit": "°C"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

**Response:**

Returns the full updated dashboard object:

```json
{
  "id": "unique-dashboard-id",
  "ownerUserId": "user-id",
  "title": "Climate",
  "icon": "device_thermostat",
  "tabs": [
    {
      "id": "main",
      "title": "Main",
      "cards": [
        {
          "id": "living-room",
          "title": "Living Room",
          "layout": "verticalLayout",
          "items": [
            {
              "type": "device",
              "icon": "lightbulb",
              "label": "Lamp",
              "state": true
            },
            {
              "type": "sensor",
              "icon": "thermostat",
              "label": "Temperature",
              "value": {
                "amount": 23.5,
                "unit": "°C"
              }
            }
          ]
        }
      ]
    }
  ]
}
```

---
> #### **Endpoint:** `DELETE /api/dashboards/:dashboardId`

Delete the specified dashboard.

Requires `Authorization: Bearer <token>` header.

**Response:**

```
204 No Content
```

---

### Devices

> #### **Endpoint:** `GET /api/devices`

Get list of all available items (sensors and devices) with default values (not user-specific).

Requires `Authorization: Bearer <token>` header.

**Response:**

```json
[
  {
    "id": "device-1",
    "type": "device",
    "icon": "lightbulb",
    "label": "Living Room Light",
    "state": true
  },
  {
    "id": "device-2",
    "type": "device",
    "icon": "power",
    "label": "TV Socket",
    "state": false
  }
]
```
---
> #### **Endpoint:** `GET /api/devices/user`

Get list of all user-specific items (sensors and devices) by users.

Requires `Authorization: Bearer <token>` header.

**Response:**

```json
[
  {
    "userId": "user-id",
    "devices": [
      {
        "deviceId": "temperature-outside",
        "dashboards": ["unique-dashboard-id"],
        "value": {
            "amount": 18.5,
            "unit": "°C"
        }
      },
      {
        "deviceId": "floor-lamp",
        "dashboards": ["unique-dashboard-id"],
        "state": true
      },
    ]
  },
]
```
---
> #### **Endpoint:** `PATCH /api/devices/:deviceId`

Update the state of a user-specific device.

Only items with `"type": "device"` are allowed. Attempting to patch a sensor will return `400 Bad Request`.
Attempting to patch a device that is absent in user-specific items list will return `404 Not Found`.

Requires `Authorization: Bearer <token>` header.

**Request body:**

```json
{
  "state": true
}
```

**Response:**

Returns the full updated user-specific device object:

```json
{
  "deviceId": "floor-lamp",
  "dashboards": ["unique-dashboard-id"],
  "state": true
},
```
