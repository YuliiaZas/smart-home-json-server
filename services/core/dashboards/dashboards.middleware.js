const express = require("express");
const router = express.Router();
const { requireAuth } = require("../utils/auth.utils");
const { getId } = require("../utils/id.utils");
const { initUserDevicesForDashboard, removeUserDevicesForDashboard } = require("../utils/user-devices.utils");
const { transformTabs, resolveDashboard } = require("../utils/dashboards.utils");

module.exports = (server) => {
  const getDb = () => server.db.getState();
  const getDbDashboards = (db) => db.dashboards;
  const getDbDevices = (db) => db.devices;
  const getDbUserDevices = (db) => db.userDevices;

  router.get(
    "/api/dashboards",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const db = getDb();
      const dashboards = getDbDashboards(db)
        .filter((d) => d.ownerUserId === req.user.id)
        .map(({ id, title, icon }) => ({ id, title, icon, }));
      res.json(dashboards);
    }
  );

  router.post(
    "/api/dashboards",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { title, icon } = req.body;

      if (
        typeof title !== "string" ||
        typeof icon !== "string" ||
        !title.trim() ||
        !icon.trim()
      ) {
        return res.status(400).send("Missing or invalid 'title' or 'icon'");
      }

      const db = getDb();

      const newDashboard = {
        id: getId('d'),
        ownerUserId: req.user.id,
        title,
        icon,
        tabs: [],
      };

      server.db.setState({
        ...db,
        dashboards: [...getDbDashboards(db), newDashboard],
      });

      res.status(201).json(newDashboard);
    }
  );

  router.get(
    "/api/dashboards/:dashboardId",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { dashboardId } = req.params;
      const db = getDb();
      const dashboard = getDbDashboards(db).find((d) => d.id === dashboardId && d.ownerUserId === req.user.id);

      if (!dashboard) return res.status(404).send("Dashboard not found");

      res.json(resolveDashboard({
        dashboard,
        userId: req.user.id,
        devices: getDbDevices(db),
        userDevices: getDbUserDevices(db)
      }));
    }
  );

  router.patch(
    "/api/dashboards/:dashboardId",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { dashboardId } = req.params;
      const { tabs, title, icon } = req.body;

      const db = getDb();
      const dashboards = getDbDashboards(db);
      const devices = getDbDevices(db);
      const userDevices = getDbUserDevices(db);

      const found = dashboards.find((d) => d.id === dashboardId && d.ownerUserId === req.user.id);
      if (!found) {
        return res.status(404).send("Dashboard not found");
      }

      const updatedDashboard = {
        ...found,
        ...(Array.isArray(tabs) ? { tabs: transformTabs(tabs) } : {}),
        ...(title ? { title } : {}),
        ...(icon ? { icon } : {}),
      };

      const updatedDashboards = dashboards.map((d) => d.id === dashboardId ? updatedDashboard : d);

      const updatedUserDevices = Array.isArray(tabs)
        ? initUserDevicesForDashboard({tabs, userId: req.user.id, dashboardId, devices, userDevices})
        : userDevices;

      server.db.setState({
        ...db,
        dashboards: updatedDashboards,
        userDevices: updatedUserDevices,
      });

      res.status(200).json(resolveDashboard({
        dashboard: updatedDashboard,
        userId: req.user.id,
        devices: devices,
        userDevices: updatedUserDevices
      }));
    }
  );

  router.delete(
    "/api/dashboards/:dashboardId",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { dashboardId } = req.params;

      const db = getDb();
      const dashboards = getDbDashboards(db);
      const userDevices = getDbUserDevices(db);

      const found = dashboards.some((d) => d.id === dashboardId && d.ownerUserId === req.user.id);
      if (!found) return res.status(404).send("Dashboard not found");

      const updatedDashboards = dashboards.filter((d) => d.id !== dashboardId);
      const updatedUserDevices = removeUserDevicesForDashboard(
        userDevices,
        req.user.id,
        dashboardId
      );

      server.db.setState({
        ...db,
        dashboards: updatedDashboards,
        userDevices: updatedUserDevices,
      });

      res.status(204).send();
    }
  );

  return router;
};
