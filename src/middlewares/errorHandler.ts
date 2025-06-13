import { AxiosError } from 'axios';
import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

/** Error with a http code. */
export class HttpError extends Error {
    public statusCode: number;
    public details?: any;

    constructor(statusCode: number, message: string) {
        super(message);
        this.statusCode = statusCode;

        // Set the prototype explicitly (needed when extending built-ins)
        Object.setPrototypeOf(this, HttpError.prototype);
    }
}

/** Forward the errors to the client. */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
    // Log
    if (err instanceof AxiosError)
        console.error('Error:', err, err.response);
    else console.error('Error:', err);
    // Handle http errors
    if (err instanceof HttpError) {
        res.status(err.statusCode).json({ message: err.message })
        return
    }
    // Handle zod errors
    if(err instanceof ZodError){
        res.status(422).json({ message: err.errors[0].message })
        return
    }
    // Otherwise, send the default error
    res.status(500).json({ message: 'Internal Server Error' });
}