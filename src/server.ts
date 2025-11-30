import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

// Load environment variables
dotenv.config();

// Import routes
import leagueRoutes from './modules/league/league.routes';
import teamRoutes from './routes/teams';
import matchRoutes from './routes/matches';
import predictionRoutes from './routes/predictions';
import commentRoutes from './routes/comments';
import userRoutes from './routes/users';

// Import Swagger configuration
import swaggerOptions from './config/swagger';

// Import error handling middleware
import { errorHandler } from './middleware/errorHandler';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Swagger setup
const specs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/leagues', leagueRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/users', userRoutes);

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

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Football Prediction API is running on port ${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/api-docs`);
});

export default app;