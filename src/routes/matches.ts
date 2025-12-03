/**
 * @swagger
 * tags:
 *   name: Matches
 *   description: Match management
 */

import { Router } from 'express';
import {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch
} from '../controllers/matchesController';
import { validateMatch } from '../middleware/validation';

const router = Router();

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
router.get('/', getAllMatches);

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
router.get('/:id', getMatchById);

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
 *                 example: "scheduled"
 *               allow_draw:
 *                 type: boolean
 *                 example: true
 *               home_score:
 *                 type: integer
 *                 example: 2
 *               away_score:
 *                 type: integer
 *                 example: 1
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
router.post('/', validateMatch, createMatch);

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
 *                 example: "scheduled"
 *               allow_draw:
 *                 type: boolean
 *                 example: true
 *               home_score:
 *                 type: integer
 *                 example: 2
 *               away_score:
 *                 type: integer
 *                 example: 1
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
router.put('/:id', updateMatch);

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
router.delete('/:id', deleteMatch);

// Import match detail controllers
import {
  getMatchOutcomes,
  updateMatchOutcomes,
  getMatchVoteCounts,
  updateMatchVoteCounts,
  getScorePredictions,
  voteScorePrediction,
  updateScorePredictionVoteCount,
  getMatchComments,
  createMatchComment,
  getCommentReplies,
  addCommentReaction,
  deleteMatchComment
} from '../controllers/matchesDetailController';

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
router.get('/:id/outcomes', getMatchOutcomes);

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
router.post('/:id/outcomes', updateMatchOutcomes);

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
router.get('/:id/predictions', getScorePredictions);

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
router.post('/:id/predictions', voteScorePrediction);

/**
 * @swagger
 * /api/matches/{id}/predictions/vote-count:
 *   post:
 *     summary: Update score prediction with specific values and vote count
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
 *               - vote_count
 *             properties:
 *               score_pred_id:
 *                 type: integer
 *                 description: ID of the score prediction to update (optional, if not provided, will match by scores)
 *                 example: 123
 *               home_score:
 *                 type: integer
 *                 example: 2
 *               away_score:
 *                 type: integer
 *                 example: 1
 *               vote_count:
 *                 type: integer
 *                 example: 5000
 *     responses:
 *       200:
 *         description: Score prediction updated successfully
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
 *                   example: "Score prediction updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ScorePrediction'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.post('/:id/predictions/vote-count', updateScorePredictionVoteCount);

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
router.get('/:id/comments', getMatchComments);

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
router.post('/:id/comments', createMatchComment);

/**
 * @swagger
 * /api/matches/{id}/vote-counts:
 *   get:
 *     summary: Get match vote counts (actual vote counts)
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
 *         description: Match vote counts data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     match_id:
 *                       type: integer
 *                     home_votes:
 *                       type: integer
 *                     draw_votes:
 *                       type: integer
 *                     away_votes:
 *                       type: integer
 *                     total_votes:
 *                       type: integer
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.get('/:id/vote-counts', getMatchVoteCounts);

/**
 * @swagger
 * /api/matches/{id}/vote-counts:
 *   post:
 *     summary: Update match vote counts (actual vote counts)
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
 *               home_votes:
 *                 type: integer
 *                 example: 3000
 *               draw_votes:
 *                 type: integer
 *                 example: 1000
 *               away_votes:
 *                 type: integer
 *                 example: 1000
 *     responses:
 *       200:
 *         description: Match vote counts updated successfully
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
 *                   example: "Match vote counts updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     match_id:
 *                       type: integer
 *                     home_votes:
 *                       type: integer
 *                     draw_votes:
 *                       type: integer
 *                     away_votes:
 *                       type: integer
 *                     total_votes:
 *                       type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.post('/:id/vote-counts', updateMatchVoteCounts);

/**
 * @swagger
 * /api/matches/{id}/comments/replies:
 *   get:
 *     summary: Get replies for a comment with pagination
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 5
 *         description: Number of replies per page
 *     responses:
 *       200:
 *         description: List of comment replies
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
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     current_page:
 *                       type: integer
 *                     per_page:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     total_pages:
 *                       type: integer
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.get('/:id/comments/replies', getCommentReplies);

/**
 * @swagger
 * /api/matches/{id}/comments/reactions:
 *   post:
 *     summary: Add or remove reaction to a comment
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               reaction_type:
 *                 type: string
 *                 example: "like"
 *     responses:
 *       200:
 *         description: Reaction added or removed successfully
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
 *                   example: "Reaction added successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     action:
 *                       type: string
 *                       example: "added"
 *                     reaction_count:
 *                       type: integer
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.post('/:id/comments/reactions', addCommentReaction);

/**
 * @swagger
 * /api/matches/{id}/comments:
 *   delete:
 *     summary: Delete a comment and its replies
 *     tags: [Matches]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Comment ID
 *     responses:
 *       200:
 *         description: Comment deleted successfully
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
 *                   example: "Comment deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 * */
router.delete('/:id/comments', deleteMatchComment);

export default router;