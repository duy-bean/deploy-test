const express = require("express")
const router = express.Router()

const controller = require("../Controllers/user.controller")
const authMiddleware = require("../Middlewares/auth.middleware")

// ROUTE
router.post("/register", controller.register)
router.post("/login", controller.login)
router.get("/detail", controller.detail)
router.post("/password/forgot", controller.forgotPassword)
router.post("/password/otp", controller.otpPassword)
router.post("/password/reset", controller.resetPassword)

module.exports = router