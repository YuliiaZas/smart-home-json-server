const express = require("express");
const jsonServer = require("json-server");
const router = express.Router();

router.use(
  jsonServer.rewriter({
    "/api/user/register": "/api/user/register",
    "/api/user/login": "/api/user/login",
    "/api/user/profile": "/api/user/profile",
  }),
);

module.exports = router;
