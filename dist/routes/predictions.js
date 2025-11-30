"use strict";
/**
 * @swagger
 * tags:
 *   name: Predictions
 *   description: User predictions and score predictions management
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const predictionsController_1 = require("../controllers/predictionsController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
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
router.get('/', predictionsController_1.getAllPredictions);
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
router.get('/:id', predictionsController_1.getPredictionById);
/**
 * @swagger
 * /api/predictions:
 *   post:
 *     summary: Create a new user prediction
 *     tags: [Predictions]
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
router.post('/', validation_1.validatePrediction, predictionsController_1.createPrediction);
/**
 * @swagger
 * /api/predictions/{id}:
 *   put:
 *     summary: Update a user prediction
 *     tags: [Predictions]
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
router.put('/:id', predictionsController_1.updatePrediction);
/**
 * @swagger
 * /api/predictions/{id}:
 *   delete:
 *     summary: Delete a user prediction
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
router.delete('/:id', predictionsController_1.deletePrediction);
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
 *         description: List of score predictions for the match
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
router.get('/score/:match_id', predictionsController_1.getScorePredictions);
/**
 * @swagger
 * /api/predictions/score:
 *   post:
 *     summary: Vote on a score prediction
 *     tags: [Predictions]
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
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/score', predictionsController_1.voteScorePrediction);
exports.default = router;
//# sourceMappingURL=predictions.js.map