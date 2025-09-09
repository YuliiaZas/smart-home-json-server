const express = require("express");
const router = express.Router();
const { requireAuth } = require("../utils/auth.utils");

module.exports = (server) => {
  router.get(
    "/api/devices",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const db = server.db.getState();

      if (!Array.isArray(db.devices)) return res.status(404).send("Devices list not found");

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

      if (typeof state !== "boolean") return res.status(400).send("Missing or invalid 'state'");

      const db = server.db.getState();

      const targetDevice = Array.isArray(db.devices)
        ? db.devices.find((device) => device.id === deviceId)
        : null;

      if (!targetDevice) return res.status(404).send("Device not found");

      if (targetDevice.type !== "device") return res.status(400).send("Only devices of type 'device' can be updated");
      
      const userDevicesDB = db.userDevices || [];
      
      const userEntry = userDevicesDB.find((ud) => ud.userId === user.id);
      if (!userEntry) return res.status(404).send("No devices found for this user");

      const userDevice = userEntry.devices.find((device) => device.deviceId === deviceId);
      if (!userDevice) return res.status(404).send("Device not found among user devices");

      const updatedDevice = { ...userDevice, state };

      const updatedUserDevices = userDevicesDB.map((ud) =>
        ud.userId === user.id
          ? {
              ...ud,
              devices: ud.devices.map((d) => d.deviceId === deviceId ? updatedDevice : d),
            }
          : ud
      );

      server.db.setState({
        ...db,
        userDevices: updatedUserDevices,
      });

      res.status(200).json(updatedDevice);
    }
  );

  return router;
};
