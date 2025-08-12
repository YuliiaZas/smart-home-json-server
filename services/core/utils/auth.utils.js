function getUserByToken(req, res, server) {
  const authorizationHeader =
    req.header("Authorization") && req.header("Authorization").split(" ");
  const authorizationMethod = authorizationHeader && authorizationHeader[0];
  const reqToken = authorizationHeader && authorizationHeader[1];

  if (!reqToken || authorizationMethod !== "Bearer") {
    return res.status(401).send("Unauthorized");
  }

  return server.db.getState().users.find((user) => {
    const ret = user.token.toLowerCase() === reqToken.toLowerCase();
    if (ret) console.log(user);
    return ret;
  });
}

function requireAuth(req, res, next, server) {
  const user = getUserByToken(req, res, server);
  if (!user) return res.status(401).send("Unauthorized");
  req.user = user;
  next();
}

module.exports = { getUserByToken, requireAuth };
