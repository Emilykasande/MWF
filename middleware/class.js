//ensure user is autheticated.
// exports.ensureAuthenticated = (req, res, next)=>{
//     if(req.session.user){
//         return next();
//     }
//     res.redirect('/login');
// };

exports.ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};

//ensure user is a sales agent
exports.ensuresalesagent = (req, res, next) => {
  if (req.session.user && req.session.user.role === "sales Agent") {
    return next();
  }
  res.redirect("/");
};

//ensure user is an inventory manager
// exports.ensuremanager = (req, res, next) =>{
//     if(req.session.user && req.session.user.role === 'inventory Manager'){
//         return next();
//     }
//     res.redirect('/');
// };
exports.ensureManager = (req, res, next) => {
  if (req.user.role === "manager") return next();
  res.redirect("/unauthorized");
};
