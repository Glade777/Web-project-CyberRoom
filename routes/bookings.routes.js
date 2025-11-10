// routes/bookings.routes.js
const Router = require("express");
const router = new Router();

const bookingsController = require("../controller/bookings.controller");

router.post("/bookings", bookingsController.create);
router.get("/bookings/user/:user_id", bookingsController.listByUser);

module.exports = router;
