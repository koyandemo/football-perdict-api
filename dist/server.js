"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
// Load environment variables
dotenv_1.default.config();
// Import routes
const leagues_1 = __importDefault(require("./routes/leagues"));
const teams_1 = __importDefault(require("./routes/teams"));
const matches_1 = __importDefault(require("./routes/matches"));
const predictions_1 = __importDefault(require("./routes/predictions"));
const comments_1 = __importDefault(require("./routes/comments"));
const users_1 = __importDefault(require("./routes/users"));
// Import Swagger configuration
const swagger_1 = __importDefault(require("./config/swagger"));
// Create Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Swagger setup
const specs = (0, swagger_jsdoc_1.default)(swagger_1.default);
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(specs));
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
// Routes
app.use('/api/leagues', leagues_1.default);
app.use('/api/teams', teams_1.default);
app.use('/api/matches', matches_1.default);
app.use('/api/predictions', predictions_1.default);
app.use('/api/comments', comments_1.default);
app.use('/api/users', users_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Football Prediction API is running!' });
});
// Admin route
app.get('/admin', (req, res) => {
    res.status(200).json({ message: 'Admin panel route' });
});
// Client route
app.get('/client', (req, res) => {
    res.status(200).json({ message: 'Client application route' });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Start server
app.listen(PORT, () => {
    console.log(`Football Prediction API is running on port ${PORT}`);
    console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});
exports.default = app;
//# sourceMappingURL=server.js.map