// Only check session, no Passport needed
function ensureAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect("/login");
}

function ensureManager(req, res, next) {
  if (req.session.user && req.session.user.position === "manager") return next();
  res.status(403).send("Access denied. Managers only.");
}

function ensuresalesAgent(req, res, next) {
  if (req.session.user && req.session.user.position === "sales Agent")
    return next();
  res.status(403).send("Access denied. Sales Agents only.");
}



module.exports = { ensureAuthenticated, ensureManager, ensuresalesAgent };
