import { Request, Response } from 'express';
export declare const getAllLeagues: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getLeagueById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createLeague: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateLeague: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteLeague: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=leaguesController.d.ts.map