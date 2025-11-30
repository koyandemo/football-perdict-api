/**
 * @swagger
 * tags:
 *   name: Leagues
 *   description: League management
 */

import { Router } from 'express';
import {
  getAllLeagues,
  getLeagueById,
  createLeague,
  updateLeague,
  deleteLeague
} from './league.controller';
import { validateLeague } from '../../middleware/validation';

const router = Router();

/**
 * @swagger
 * /api/leagues:
 *   get:
 *     summary: Get all leagues
 *     tags: [Leagues]
 *     responses:
 *       200:
 *         description: List of leagues
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
 *                     $ref: '#/components/schemas/League'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', getAllLeagues);

/**
 * @swagger
 * /api/leagues/{id}:
 *   get:
 *     summary: Get a league by ID
 *     tags: [Leagues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: League ID
 *     responses:
 *       200:
 *         description: League data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/League'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', getLeagueById);

/**
 * @swagger
 * /api/leagues:
 *   post:
 *     summary: Create a new league
 *     tags: [Leagues]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premier League"
 *               country:
 *                 type: string
 *                 example: "England"
 *     responses:
 *       201:
 *         description: League created successfully
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
 *                   example: "League created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/League'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', validateLeague, createLeague);

/**
 * @swagger
 * /api/leagues/{id}:
 *   put:
 *     summary: Update a league
 *     tags: [Leagues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: League ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premier League"
 *               country:
 *                 type: string
 *                 example: "England"
 *     responses:
 *       200:
 *         description: League updated successfully
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
 *                   example: "League updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/League'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', updateLeague);

/**
 * @swagger
 * /api/leagues/{id}:
 *   delete:
 *     summary: Delete a league
 *     tags: [Leagues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: League ID
 *     responses:
 *       200:
 *         description: League deleted successfully
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
 *                   example: "League deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', deleteLeague);

export default router;