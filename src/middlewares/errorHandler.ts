import { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    console.error('Error:', err);
    res.status(500).send({ message: 'Internal Server Error' });
}