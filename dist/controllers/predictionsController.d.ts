import { Request, Response } from 'express';
export declare const getAllPredictions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getPredictionById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createPrediction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updatePrediction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deletePrediction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getScorePredictions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const voteScorePrediction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=predictionsController.d.ts.map