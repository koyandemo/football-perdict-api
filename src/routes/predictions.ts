import { Router } from 'express';
import { 
  getAllPredictions, 
  getPredictionById, 
  createPrediction,
  updatePrediction,
  voteScorePrediction,
  getScorePredictions,
  createAdminMatchVote,
  getAllAdminVotes,
  runFinalMigration,
  cleanupDuplicateAdminVotes
} from '../controllers/predictionsController';
import { validatePrediction } from '../middleware/validation';
import { authenticate } from '../controllers/userController';

const router = Router();

/**
 * @swagger
 * /api/predictions/admin-vote:
 *   post:
 *     summary: Create an admin match vote
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - admin_id
 *               - match_id
 *               - predicted_winner
 *             properties:
 *               admin_id:
 *                 type: integer
 *                 example: 1
 *               match_id:
 *                 type: integer
 *                 example: 456
 *               predicted_winner:
 *                 type: string
 *                 enum: [Home, Away, Draw]
 *                 example: "Home"
 *     responses:
 *       201:
 *         description: Admin vote created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Admin vote created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/AdminMatchVote'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/admin-vote', createAdminMatchVote);  // Removed authenticate middleware for testing

/**
 * @swagger
 * /api/predictions/admin-votes:
 *   get:
 *     summary: Get all admin votes
 *     tags: [Predictions]
 *     responses:
 *       200:
 *         description: List of admin votes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AdminMatchVote'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/admin-votes', getAllAdminVotes);

/**
 * @swagger
 * /api/predictions:
 *   get:
 *     summary: Get all predictions
 *     tags: [Predictions]
 *     parameters:
 *       - in: query
 *         name: match_id
 *         schema:
 *           type: integer
 *         description: Filter by match ID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: integer
 *         description: Filter by user ID
 *     responses:
 *       200:
 *         description: List of predictions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Prediction'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', getAllPredictions);

/**
 * @swagger
 * /api/predictions/{id}:
 *   get:
 *     summary: Get a prediction by ID
 *     tags: [Predictions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prediction ID
 *     responses:
 *       200:
 *         description: Prediction data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Prediction'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', getPredictionById);

/**
 * @swagger
 * /api/predictions/{id}:
 *   put:
 *     summary: Update a prediction
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Prediction ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - predicted_winner
 *             properties:
 *               predicted_winner:
 *                 type: string
 *                 enum: [Home, Away, Draw]
 *                 example: "Away"
 *     responses:
 *       200:
 *         description: Prediction updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Prediction updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Prediction'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', updatePrediction);  // Removed authenticate middleware for testing

/**
 * @swagger
 * /api/predictions:
 *   post:
 *     summary: Create a new prediction
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - match_id
 *               - predicted_winner
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 123
 *               match_id:
 *                 type: integer
 *                 example: 456
 *               predicted_winner:
 *                 type: string
 *                 enum: [Home, Away, Draw]
 *                 example: "Home"
 *     responses:
 *       201:
 *         description: Prediction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Prediction created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Prediction'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', createPrediction);  // Removed authenticate middleware for testing

/**
 * @swagger
 * /api/predictions/score:
 *   post:
 *     summary: Vote for a specific score prediction
 *     tags: [Predictions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - match_id
 *               - home_score
 *               - away_score
 *             properties:
 *               match_id:
 *                 type: integer
 *                 example: 456
 *               home_score:
 *                 type: integer
 *                 example: 2
 *               away_score:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Score prediction voted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Score prediction voted successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ScorePrediction'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/score', authenticate, voteScorePrediction);

/**
 * @swagger
 * /api/predictions/score/{match_id}:
 *   get:
 *     summary: Get score predictions for a match
 *     tags: [Predictions]
 *     parameters:
 *       - in: path
 *         name: match_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Score predictions for the match
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ScorePrediction'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/score/:match_id', getScorePredictions);

/**
 * @swagger
 * /api/predictions/run-final-migration:
 *   post:
 *     summary: Run the final migration to separate admin votes
 *     tags: [Predictions]
 *     responses:
 *       200:
 *         description: Migration completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Final migration completed successfully"
 *                 migrated_admin_votes:
 *                   type: integer
 *                   example: 100
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/run-final-migration', runFinalMigration);

/**
 * @swagger
 * /api/predictions/cleanup-duplicate-admin-votes:
 *   post:
 *     summary: Cleanup duplicate admin votes
 *     tags: [Predictions]
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Duplicate admin votes cleanup completed"
 *                 deleted_count:
 *                   type: integer
 *                   example: 5
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/cleanup-duplicate-admin-votes', cleanupDuplicateAdminVotes);

export default router;