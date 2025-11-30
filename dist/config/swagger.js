"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Football Prediction API',
            version: '1.0.0',
            description: 'API for managing football predictions, leagues, teams, matches, and comments',
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server',
            },
        ],
        components: {
            schemas: {
                League: {
                    type: 'object',
                    properties: {
                        league_id: {
                            type: 'integer',
                            description: 'Unique identifier for the league',
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the league',
                        },
                        country: {
                            type: 'string',
                            description: 'Country of the league',
                        },
                        slug: {
                            type: 'string',
                            description: 'URL-friendly slug for the league (automatically generated from name and country)',
                        },
                    },
                },
                Team: {
                    type: 'object',
                    properties: {
                        team_id: {
                            type: 'integer',
                            description: 'Unique identifier for the team',
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the team',
                        },
                        short_code: {
                            type: 'string',
                            description: 'Short code for the team',
                        },
                        logo_url: {
                            type: 'string',
                            description: 'URL to the team logo',
                        },
                        country: {
                            type: 'string',
                            description: 'Country of the team',
                        },
                        slug: {
                            type: 'string',
                            description: 'URL-friendly slug for the team',
                        },
                    },
                },
                Match: {
                    type: 'object',
                    properties: {
                        match_id: {
                            type: 'integer',
                            description: 'Unique identifier for the match',
                        },
                        league_id: {
                            type: 'integer',
                            description: 'Identifier for the league',
                        },
                        home_team_id: {
                            type: 'integer',
                            description: 'Identifier for the home team',
                        },
                        away_team_id: {
                            type: 'integer',
                            description: 'Identifier for the away team',
                        },
                        match_date: {
                            type: 'string',
                            format: 'date',
                            description: 'Date of the match',
                        },
                        match_time: {
                            type: 'string',
                            format: 'time',
                            description: 'Time of the match',
                        },
                        venue: {
                            type: 'string',
                            description: 'Venue of the match',
                        },
                        status: {
                            type: 'string',
                            description: 'Status of the match',
                        },
                        slug: {
                            type: 'string',
                            description: 'URL-friendly slug for the match',
                        },
                        allow_draw: {
                            type: 'boolean',
                            description: 'Whether the match allows draw predictions',
                        },
                    },
                },
                UserPrediction: {
                    type: 'object',
                    properties: {
                        prediction_id: {
                            type: 'integer',
                            description: 'Unique identifier for the prediction',
                        },
                        user_id: {
                            type: 'integer',
                            description: 'Identifier for the user',
                        },
                        match_id: {
                            type: 'integer',
                            description: 'Identifier for the match',
                        },
                        predicted_winner: {
                            type: 'string',
                            enum: ['Home', 'Away', 'Draw'],
                            description: 'Predicted winner of the match',
                        },
                        prediction_date: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Date and time of the prediction',
                        },
                    },
                },
                ScorePrediction: {
                    type: 'object',
                    properties: {
                        score_pred_id: {
                            type: 'integer',
                            description: 'Unique identifier for the score prediction',
                        },
                        match_id: {
                            type: 'integer',
                            description: 'Identifier for the match',
                        },
                        home_score: {
                            type: 'integer',
                            description: 'Predicted home team score',
                        },
                        away_score: {
                            type: 'integer',
                            description: 'Predicted away team score',
                        },
                        vote_count: {
                            type: 'integer',
                            description: 'Number of votes for this prediction',
                        },
                    },
                },
                Comment: {
                    type: 'object',
                    properties: {
                        comment_id: {
                            type: 'integer',
                            description: 'Unique identifier for the comment',
                        },
                        user_id: {
                            type: 'integer',
                            description: 'Identifier for the user',
                        },
                        match_id: {
                            type: 'integer',
                            description: 'Identifier for the match',
                        },
                        comment_text: {
                            type: 'string',
                            description: 'Text of the comment',
                        },
                        timestamp: {
                            type: 'string',
                            format: 'date-time',
                            description: 'Timestamp of the comment',
                        },
                    },
                },
            },
            responses: {
                ValidationError: {
                    description: 'Validation failed',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: false,
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Validation error message',
                                    },
                                },
                            },
                        },
                    },
                },
                NotFoundError: {
                    description: 'Resource not found',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: false,
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Resource not found',
                                    },
                                },
                            },
                        },
                    },
                },
                ServerError: {
                    description: 'Internal server error',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    success: {
                                        type: 'boolean',
                                        example: false,
                                    },
                                    message: {
                                        type: 'string',
                                        example: 'Internal server error',
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
    apis: ['./src/routes/*.ts'], // Paths to files containing OpenAPI definitions
};
exports.default = options;
//# sourceMappingURL=swagger.js.map