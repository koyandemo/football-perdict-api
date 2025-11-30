"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// Public routes
router.post('/register', userController_1.register);
router.post('/login', userController_1.login);
// Protected routes
router.get('/profile', userController_1.authenticate, userController_1.getProfile);
// Admin routes
router.get('/admin', userController_1.authenticate, userController_1.requireAdmin, (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin access granted',
        user: req.user
    });
});
exports.default = router;
//# sourceMappingURL=users.js.map