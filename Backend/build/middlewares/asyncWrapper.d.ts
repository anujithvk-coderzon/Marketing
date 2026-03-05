import { Request, Response, NextFunction } from "express";
type AsyncFunction = (req: Request, res: Response, next: NextFunction) => Promise<any>;
export declare const asyncWrapper: (fn: AsyncFunction) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=asyncWrapper.d.ts.map