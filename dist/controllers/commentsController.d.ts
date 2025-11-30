import { Request, Response } from 'express';
export declare const getAllComments: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const getCommentById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const createComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const updateComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export declare const deleteComment: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=commentsController.d.ts.map