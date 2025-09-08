const bcrypt = require("bcryptjs");
const express = require("express");
const router = express.Router();
const { signAccessToken } = require("../utils/auth.jwt.utils");
const { requireAuth } = require("../utils/auth.utils");
const { getId } = require("../utils/id.utils");
const { initUserDevicesForDashboard } = require("../utils/user-devices.utils");


module.exports = (server) => {
  function getInitials(name) {
    const parts = name.trim().split(" ");
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return parts.map((part) => part[0]).join("").toUpperCase();
  }

  router.post("/api/user/register", async (req, res) => {
    const { userName, password, fullName } = req.body;
    if (!userName || !password) return res.status(400).send("Missing username or password");

    const db = server.db.getState();
    const exists = db.users.some((u) => u.userName.toLowerCase() === userName.toLowerCase());

    if (exists) return res.status(400).send("User already exists");

    const hash = await bcrypt.hash(password, 10);
    const newUser = {
      id: getId('u'),
      userName,
      passwordHash: hash,
      fullName: fullName || userName,
      initials: getInitials(fullName || userName),
      tokenVersion: 1,
    };

    // Save new user to db
    server.db.setState({
      ...db,
      users: [...db.users, newUser],
    });

    // Create default dashboards from templates for new user
    const templates = db.dashboardTemplates || [];
    const userDashboards = templates.map((tpl) => ({
      ...tpl,
      ownerUserId: newUser.id,
      id: getId('ud'),
    }));
    const dashboards = [ ...db.dashboards, ...userDashboards ];

    // Init userDevices for those dashboards
    let updatedUserDevices = db.userDevices;
    userDashboards.forEach((d) => {
      updatedUserDevices = initUserDevicesForDashboard({
        tabs: d.tabs,
        userId: newUser.id,
        dashboardId: d.id,
        devices: db.devices,
        userDevices: updatedUserDevices
      });
    });

    // Save dashboards and userDevices to db
    server.db.setState({
      ...server.db.getState(),
      dashboards,
      userDevices: updatedUserDevices,
    });
    
    const token = signAccessToken(newUser);
    
    res.json({ token, dashboardId: userDashboards[0]?.id || null });
  });

  router.post("/api/user/login", async (req, res) => {
    const { userName, password } = req.body;

    const users = server.db.getState().users;
    const matchedUser = users.find((user) =>user.userName.toLowerCase() === userName.toLowerCase());

    if (!matchedUser) return res.status(401).send("Wrong username or password");

    const hash = await bcrypt.hash(password, 10);
    const ok = await bcrypt.compare(password, matchedUser.passwordHash);

    if (!ok) return res.status(401).send("Wrong username or password");

    const token = signAccessToken(matchedUser);

    res.json({ token });
  });

  router.get(
    "/api/user/profile",
    (req, res, next) => requireAuth(req, res, next, server),
    (req, res) => {
      const db = server.db.getState();
      const user = db.users.find((u) => u.id === req.user.id);
  
      if (!user) return res.status(401).send("Unauthorized");
  
      const { passwordHash, tokenVersion, ...safeUser } = user;
      res.json(safeUser);
    }
  );

  return router;
};
