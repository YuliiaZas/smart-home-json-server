const express = require("express");
const router = express.Router();
const { requireAuth } = require("../utils/auth.utils");

module.exports = (server) => {
  const getDb = () => server.db.getState();
  const getDbDashboards = () => getDb().dashboards;

  router.get(
    "/api/dashboards",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const dashboards = getDbDashboards().map(({ id, title, icon }) => ({
        id,
        title,
        icon,
      }));
      res.json(dashboards);
    }
  );

  router.post(
    "/api/dashboards",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { id, title, icon } = req.body;

      if (
        typeof id !== "string" ||
        typeof title !== "string" ||
        typeof icon !== "string" ||
        !id.trim() ||
        !title.trim() ||
        !icon.trim()
      ) {
        return res
          .status(400)
          .send("Missing or invalid 'id', 'title' or 'icon'");
      }

      const db = getDb();
      const dashboards = db.dashboards;

      const exists = dashboards.some((d) => d.id === id);
      if (exists) {
        return res.status(400).send("Dashboard with this ID already exists");
      }

      const newDashboard = {
        id,
        title,
        icon,
      };

      const updatedDashboards = [...dashboards, newDashboard];

      server.db.setState({
        ...db,
        dashboards: updatedDashboards,
      });

      res.status(201).json(newDashboard);
    }
  );

  router.get(
    "/api/dashboards/:dashboardId",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { dashboardId } = req.params;
      const dashboard = getDbDashboards().find((d) => d.id === dashboardId);

      if (!dashboard) {
        return res.status(404).send("Dashboard not found");
      }

      res.json({ tabs: dashboard.tabs || [] });
    }
  );

  router.put(
    "/api/dashboards/:dashboardId",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { dashboardId } = req.params;
      const { tabs } = req.body;

      if (!Array.isArray(tabs)) {
        return res
          .status(400)
          .send("Invalid or missing 'tabs' in request body");
      }

      const db = getDb();
      const dashboards = db.dashboards;

      const found = dashboards.some((d) => d.id === dashboardId);
      if (!found) {
        return res.status(404).send("Dashboard not found");
      }

      const updatedDashboards = dashboards.map((dashboard) =>
        dashboard.id === dashboardId ? { ...dashboard, tabs } : dashboard
      );

      server.db.setState({
        ...db,
        dashboards: updatedDashboards,
      });

      const updatedDashboard = updatedDashboards.find(
        (d) => d.id === dashboardId
      );
      res.status(200).json({ tabs: updatedDashboard.tabs });
    }
  );

  router.put(
    "/api/dashboards/:dashboardId/info",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { dashboardId } = req.params;
      const { title, icon } = req.body;

      if (
        typeof title !== "string" ||
        typeof icon !== "string" ||
        !title.trim() ||
        !icon.trim()
      ) {
        return res
          .status(400)
          .send("Missing or invalid 'title' or 'icon'");
      }

      const db = getDb();
      const dashboards = db.dashboards;

      const found = dashboards.some((d) => d.id === dashboardId);
      if (!found) {
        return res.status(404).send("Dashboard not found");
      }

      const updatedDashboards = dashboards.map((dashboard) =>
        dashboard.id === dashboardId ? { ...dashboard, title, icon } : dashboard
      );

      server.db.setState({
        ...db,
        dashboards: updatedDashboards,
      });

      res.status(200).json({ id: dashboardId, title, icon });
    }
  );

  router.delete(
    "/api/dashboards/:dashboardId",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const { dashboardId } = req.params;

      const db = getDb();
      const dashboards = db.dashboards;

      const found = dashboards.some((d) => d.id === dashboardId);
      if (!found) {
        return res.status(404).send("Dashboard not found");
      }

      const updatedDashboards = dashboards.filter((d) => d.id !== dashboardId);

      server.db.setState({
        ...db,
        dashboards: updatedDashboards,
      });

      res.status(204).send();
    }
  );

  return router;
};
