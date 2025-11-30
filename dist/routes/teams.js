"use strict";
/**
 * @swagger
 * tags:
 *   name: Teams
 *   description: Team management
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const teamsController_1 = require("../controllers/teamsController");
const validation_1 = require("../middleware/validation");
const router = (0, express_1.Router)();
/**
 * @swagger
 * /api/teams:
 *   get:
 *     summary: Get all teams
 *     tags: [Teams]
 *     responses:
 *       200:
 *         description: List of teams
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
 *                     $ref: '#/components/schemas/Team'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/', teamsController_1.getAllTeams);
/**
 * @swagger
 * /api/teams/{id}:
 *   get:
 *     summary: Get a team by ID
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.get('/:id', teamsController_1.getTeamById);
/**
 * @swagger
 * /api/teams:
 *   post:
 *     summary: Create a new team
 *     tags: [Teams]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - short_code
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Manchester United"
 *               short_code:
 *                 type: string
 *                 example: "MUN"
 *               logo_url:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *               country:
 *                 type: string
 *                 example: "England"
 *     responses:
 *       201:
 *         description: Team created successfully
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
 *                   example: "Team created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.post('/', validation_1.validateTeam, teamsController_1.createTeam);
/**
 * @swagger
 * /api/teams/{id}:
 *   put:
 *     summary: Update a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Manchester United"
 *               short_code:
 *                 type: string
 *                 example: "MUN"
 *               logo_url:
 *                 type: string
 *                 example: "https://example.com/logo.png"
 *               country:
 *                 type: string
 *                 example: "England"
 *     responses:
 *       200:
 *         description: Team updated successfully
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
 *                   example: "Team updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Team'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.put('/:id', teamsController_1.updateTeam);
/**
 * @swagger
 * /api/teams/{id}:
 *   delete:
 *     summary: Delete a team
 *     tags: [Teams]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Team ID
 *     responses:
 *       200:
 *         description: Team deleted successfully
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
 *                   example: "Team deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *       500:
 *         $ref: '#/components/responses/ServerError'
 */
router.delete('/:id', teamsController_1.deleteTeam);
exports.default = router;
//# sourceMappingURL=teams.js.map