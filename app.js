/** BizTime express application. */


const express = require("express");

const ExpressError = require("./expressError")
const companiesRoutes = require("./routes/companies")
const invoicesRoutes = require("./routes/invoices")
const industriesRoutes = require("./routes/industries");
const app = express();


// Parse request bodies for JSON
app.use(express.json());

// line 12 and 13 are added by me
app.use("/companies",companiesRoutes);
app.use("/invoices",invoicesRoutes);
app.use("/industries", industriesRoutes)


/** 404 handler */

app.use(function(req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */

app.use((err, req, res, next) => {
  res.status(err.status || 500);

  return res.json({
    error: err,
    message: err.message
  });
});


module.exports = app;


// app.listen(3001, function () {
//   console.log("Listening on 3000");
// });