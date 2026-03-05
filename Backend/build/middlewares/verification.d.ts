import { JwtPayload } from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
interface AuthPayload extends JwtPayload {
    id: string;
}
type Requests = Request & {
    user?: AuthPayload;
};
export declare const verify: (req: Requests, res: Response, next: NextFunction) => Promise<void>;
export declare const refresh_Token: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export {};
//# sourceMappingURL=verification.d.ts.map