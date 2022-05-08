import { Request, Response } from 'express';
import { Redis } from 'ioredis';

export interface myCtx {
    req: Request;
    res: Response;
    redis: Redis;
}
