import { AxiosError } from 'axios';
import { NextFunction, Request, Response } from 'express';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    if (err instanceof AxiosError)
        console.error('Error:', err, err.response);
    else console.error('Error:', err);
    res.status(500).send({ message: 'Internal Server Error' });
}