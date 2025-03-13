const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController")

router.get("/", categoryController.getcategories);
router.get("/:id", categoryController.getcategory);
router.post("/", categoryController.create);
// router.post("/deletebyids", categoryController.deleteByMultipleIds);
router.put("/:id", categoryController.updatecategory);
router.delete("/:id", categoryController.deletecategory);

module.exports = router;
