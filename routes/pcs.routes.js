// routes/pcs.routes.js
const Router = require("express");
const router = new Router();

const pcsController = require("../controller/pcs.controller");

// (опційно) список усіх активних ПК
router.get("/pcs", pcsController.list);

// деталі по конкретному ПК (label = PC-01, PC-02, ...)
router.get("/pcs/:label", pcsController.getByLabel);

module.exports = router;
