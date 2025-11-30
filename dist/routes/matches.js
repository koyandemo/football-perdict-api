"use strict";
/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match management
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchesController_1 = require("../controllers/matchesController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/matches:
 *   get:
 *     summary: Get all matches
 *     tags: [Matches]
 *     parameters:
 *       - in: query
 *         name: league_id
 *         schema:
 *           type: integer
 *         description: Filter by league ID
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by match date (YYYY-MM-DD)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: Filter by match status
 *     responses:
 *       200:
 *         description: List of matches
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
 *                     $ref: '#/components/schemas/Match'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', matchesController_1.getAllMatches);
/**
 * @swagger
 * /api/matches/{id}:
 *   get:
 *     summary: Get a match by ID
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', matchesController_1.getMatchById);
/**
 * @swagger
 * /api/matches:
 *   post:
 *     summary: Create a new match
 *     tags: [Matches]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - league_id
 *               - home_team_id
 *               - away_team_id
 *               - match_date
 *               - match_time
 *             properties:
 *               league_id:
 *                 type: integer
 *                 example: 1
 *               home_team_id:
 *                 type: integer
 *                 example: 10
 *               away_team_id:
 *                 type: integer
 *                 example: 15
 *               match_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-10-15"
 *               match_time:
 *                 type: string
 *                 example: "15:00"
 *               venue:
 *                 type: string
 *                 example: "Old Trafford"
 *               status:
 *                 type: string
 *                 example: "Upcoming"
 *     responses:
 *       201:
 *         description: Match created successfully
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
 *                   example: "Match created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', validation_1.validateMatch, matchesController_1.createMatch);
/**
 * @swagger
 * /api/matches/{id}:
 *   put:
 *     summary: Update a match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               league_id:
 *                 type: integer
 *                 example: 1
 *               home_team_id:
 *                 type: integer
 *                 example: 10
 *               away_team_id:
 *                 type: integer
 *                 example: 15
 *               match_date:
 *                 type: string
 *                 format: date
 *                 example: "2023-10-15"
 *               match_time:
 *                 type: string
 *                 example: "15:00"
 *               venue:
 *                 type: string
 *                 example: "Old Trafford"
 *               status:
 *                 type: string
 *                 example: "Upcoming"
 *     responses:
 *       200:
 *         description: Match updated successfully
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
 *                   example: "Match updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Match'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', matchesController_1.updateMatch);
/**
 * @swagger
 * /api/matches/{id}:
 *   delete:
 *     summary: Delete a match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match deleted successfully
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
 *                   example: "Match deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.delete('/:id', matchesController_1.deleteMatch);
// Import match detail controllers
const matchesDetailController_1 = require("../controllers/matchesDetailController");
/**
 * @swagger
 * /api/matches/{id}/outcomes:
 *   get:
 *     summary: Get match outcomes
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: Match outcomes data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MatchOutcome'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.get('/:id/outcomes', matchesDetailController_1.getMatchOutcomes);
/**
 * @swagger
 * /api/matches/{id}/outcomes:
 *   post:
 *     summary: Update match outcomes
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               home_win_prob:
 *                 type: integer
 *                 example: 45
 *               draw_prob:
 *                 type: integer
 *                 example: 20
 *               away_win_prob:
 *                 type: integer
 *                 example: 35
 *     responses:
 *       200:
 *         description: Match outcomes updated successfully
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
 *                   example: "Match outcomes updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/MatchOutcome'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.post('/:id/outcomes', matchesDetailController_1.updateMatchOutcomes);
/**
 * @swagger
 * /api/matches/{id}/predictions:
 *   get:
 *     summary: Get score predictions for a match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: List of score predictions
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
 * */
router.get('/:id/predictions', matchesDetailController_1.getScorePredictions);
/**
 * @swagger
 * /api/matches/{id}/predictions:
 *   post:
 *     summary: Vote for a score prediction
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - home_score
 *               - away_score
 *             properties:
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
 * */
router.post('/:id/predictions', matchesDetailController_1.voteScorePrediction);
/**
 * @swagger
 * /api/matches/{id}/comments:
 *   get:
 *     summary: Get comments for a match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     responses:
 *       200:
 *         description: List of comments
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
 *                     $ref: '#/components/schemas/Comment'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.get('/:id/comments', matchesDetailController_1.getMatchComments);
/**
 * @swagger
 * /api/matches/{id}/comments:
 *   post:
 *     summary: Create a comment for a match
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Match ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - comment_text
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               comment_text:
 *                 type: string
 *                 example: "Great match prediction!"
 *     responses:
 *       201:
 *         description: Comment created successfully
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
 *                   example: "Comment created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.post('/:id/comments', matchesDetailController_1.createMatchComment);
exports.default = router;
//# sourceMappingURL=matches.js.map