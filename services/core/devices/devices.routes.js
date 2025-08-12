const express = require("express");
const jsonServer = require("json-server");
const router = express.Router();

router.use(
  jsonServer.rewriter({
    "/api/devices": "/api/devices",
    "/api/devices/:deviceId": "/api/devices/:deviceId",
  }),
);

module.exports = router;
