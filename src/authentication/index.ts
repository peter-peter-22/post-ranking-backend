import { eq } from 'drizzle-orm';
import { NextFunction, Request, Response } from 'express';
import { db } from '../db';
import { User, users } from '../db/schema/users';

async function authenticate(req: Request): Promise<User> {
    // valid header: "userhandle username"
    const header = req.headers?.authorization;

    //check if header exist
    if (!header)
        throw new Error("No authorization header")
    const words = header.split(" ")

    //check if there are exactly 2 words
    if (words.length !== 2)
        throw new Error(`The authorization header must contain exactly 2 words, but it contains \"${words.length}\"`)

    //check if the type is userhandle
    if (words[0] !== "userhandle")
        throw new Error(`The authorization header must start with \"userhandle\", not \"${words[0]}\"`)

    //get the userhandle
    const userhandle = words[1];

    //get the user from the db
    const user = (
        await db.select()
            .from(users)
            .where(eq(users.handle, userhandle))
    )[0]

    //check if the user exists
    if (!user)
        throw new Error("No user belongs to this identifier")

    return user
}

//extend the request to contain the user added by the middleware
declare module 'express' {
    interface Request {
        authentication?: {
            user?: User;
            error?: string;
        }
    }
}

//middleware that authenticates the user and adds it to the request
export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
    try {
        const user = await authenticate(req)
        req.authentication = { user }
    }
    catch (e) {
        if (e instanceof Error) {
            req.authentication = { error: e.message };
        } else {
            req.authentication = { error: "unknown error" };
        }
    }
    next()
}

//get the authenticated user if exists
export function getUser(req: Request): User | undefined {
    return req.authentication?.user
}

//get the authenticated user or throw error
export function getUserOrThrow(req: Request): User {
    const user = req.authentication?.user
    if (!user)
        throw new Error("Unauthorized!")
    return user
}

//throw error if unauthenticated 
export function protectedMiddleware(req: Request, res: Response, next: NextFunction) {
    if (getUser(req))
        return next()

    res.status(401).send("Unauthorized! " + req.authentication?.error)
}