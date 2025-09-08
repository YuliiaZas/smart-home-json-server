const express = require("express");
const router = express.Router();
const { requireAuth } = require("../utils/auth.utils");

module.exports = (server) => {
  router.get(
    "/api/devices",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const db = server.db.getState();

      if (!Array.isArray(db.devices)) {
        return res.status(404).send("Devices list not found");
      }

      res.json(db.devices);
    }
  );

  router.get(
    "/api/devices/user",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const db = server.db.getState();

      if (!Array.isArray(db.userDevices)) return res.status(404).send("User devices list not found");

      res.json(db.userDevices.filter((ud) => ud.userId === req.user.id));
    }
  );

  router.patch(
    "/api/devices/:deviceId",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { deviceId } = req.params;
      const { state } = req.body;
      const { user } = req;

      if (typeof state !== "boolean") {
        return res.status(400).send("Missing or invalid 'state'");
      }

      const db = server.db.getState();

      const targetDevice = Array.isArray(db.devices)
        ? db.devices.find((device) => device.id === deviceId)
        : null;

      if (!targetDevice) {
        return res.status(404).send("Device not found");
      }

      if (targetDevice.type !== "device") {
        return res
          .status(400)
          .send("Only devices of type 'device' can be updated");
      }

      let userDevices = db.userDevices || [];

      const userDeviceIndex = userDevices.findIndex(
        (ud) => ud.userId === user.id && ud.deviceId === deviceId
      );

      if (userDeviceIndex < 0) {
        return res.status(404).send("Device not found among user devices");
      }

      const updatedDevice = { ...userDevices[idx], state };
      userDevices[idx] = updatedDevice;

      server.db.setState({
        ...db,
        userDevices,
      });

      res.status(200).json(updatedDevice);
    }
  );

  return router;
};
