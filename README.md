# Smart Home API

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

- The backend uses **sample data** stored in `*.db.json` files.
- You are free to **modify or replace** this data to suit your testing needs.
- All in-memory changes (e.g., via PATCH/POST/DELETE) will be lost after restarting the server.

## Postman Collection

Import the Postman collection to explore and test API endpoints:

**[Smart Home UI Postman Collection](./smart-home-ui.postman_collection.json)**

## Available API Endpoints

### Authentication

#### `POST /api/user/login`

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

#### `GET /api/user/profile`

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

#### `GET /api/dashboards`

Get list of available dashboards.

Requires `Authorization: Bearer <token>` header.

**Response:**

```json
[
  { "id": "overview", "title": "Overview", "icon": "home" },
  { "id": "electricity", "title": "Electricity", "icon": "bolt" }
]
```

#### `POST /api/dashboards`

Create a new dashboard.

Requires `Authorization: Bearer <token>` header.

**Request body:**

```json
{
  "id": "climate",
  "title": "Climate",
  "icon": "device_thermostat"
}
```

All fields are required and must be non-empty strings.

**Response:**

```json
{
  "id": "climate",
  "title": "Climate",
  "icon": "device_thermostat",
}
```

#### `GET /api/dashboards/:dashboardId`

Get tabs and cards for a specific dashboard.

Requires `Authorization: Bearer <token>` header.

**Response:**

```json
{
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

#### `PUT /api/dashboards/:dashboardId`

Replace the contents of an existing dashboard.

Requires `Authorization: Bearer <token>` header.

**Request body:**

```json
{
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

#### `DELETE /api/dashboards/:dashboardId`

Delete the specified dashboard.

Requires `Authorization: Bearer <token>` header.

**Response:**

```
204 No Content
```

---

### Devices

#### `GET /api/devices`

Get list of all available devices.

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

#### `PATCH /api/devices/:deviceId`

Update the state of a device across both `dashboards` and the `devices` list.

Only items with `"type": "device"` are allowed. Attempting to patch a sensor will return `400 Bad Request`.

Requires `Authorization: Bearer <token>` header.

**Request body:**

```json
{
  "state": true
}
```

**Response:**

Returns the full updated device object:

```json
{
  "id": "device-1",
  "type": "device",
  "icon": "lightbulb",
  "label": "Living Room Light",
  "state": true
}
```
