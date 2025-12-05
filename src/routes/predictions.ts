/**
 * @swagger
 * tags:
 *   name: Predictions
 *   description: User predictions and score predictions management
 */

import { Router } from 'express';
import {
  getAllPredictions,
  getPredictionById,
  createPrediction,
  updatePrediction,
  deletePrediction,
  getScorePredictions,
  voteScorePrediction
} from '../controllers/predictionsController';
import { validatePrediction } from '../middleware/validation';
import { authenticate } from '../controllers/userController';

const router = Router();

/**
 * @swagger
 * /api/predictions:
 *   get:
 *     summary: Get all user predictions
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
 *         description: List of user predictions
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
 *                     $ref: '#/components/schemas/UserPrediction'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', getAllPredictions);

/**
 * @swagger
 * /api/predictions/{id}:
 *   get:
 *     summary: Get a user prediction by ID
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
 *         description: User prediction data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/UserPrediction'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', getPredictionById);

/**
 * @swagger
 * /api/predictions:
 *   post:
 *     summary: Create a new user prediction
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
 *         description: User prediction created successfully
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
 *                   $ref: '#/components/schemas/UserPrediction'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', authenticate, validatePrediction, createPrediction);

/**
 * @swagger
 * /api/predictions/{id}:
 *   put:
 *     summary: Update a user prediction
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
 *         description: User prediction updated successfully
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
 *                   $ref: '#/components/schemas/UserPrediction'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', authenticate, updatePrediction);

/**
 * @swagger
 * /api/predictions/{id}:
 *   delete:
 *     summary: Delete a user prediction
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
 *     responses:
 *       200:
 *         description: User prediction deleted successfully
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
 *                   example: "Prediction deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', authenticate, deletePrediction);

export default router;