function ensureAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/login");
}

function ensureManager(req, res, next) {
  if (
    req.session.user &&
    req.session.user.position.toLowerCase() === "manager"
  ) {
    return next();
  }
  res.status(403).send("Access denied. Managers only.");
}

function ensureSalesAgent(req, res, next) {
  if (
    req.session.user &&
    req.session.user.position.toLowerCase() === "sales agent"
  ) {
    return next();
  }
  res.status(403).send("Access denied. Sales Agents only.");
}

function blockStaffFromEcommerce(req, res, next) {
  if (
    req.session.user &&
    ["manager", "sales agent"].includes(req.session.user.position.toLowerCase())
  ) {
    return res.redirect("/dashboard");
  }
  next();
}

module.exports = {ensureAuthenticated,ensureManager, ensureSalesAgent, blockStaffFromEcommerce,};
