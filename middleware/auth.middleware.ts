import {Response, Request, NextFunction } from "express"
import JWT from 'jsonwebtoken';

import { AppError } from '../utils/appError';
import { UsersDBUtils } from '../utils/db.users';

interface IsLoginRequest extends Request {
    cookie?: {
        jwt: string;
    };
    user: any;
};

export interface TokenInterface {
  userId?: string
}

class RouteValidation{
    
    static isLoggedIn = async function (req: IsLoginRequest, res: Response, next: NextFunction) {
        try {
            let token;
            if (
                req.headers.authorization &&
                req.headers.authorization.startsWith("Bearer")
            ) {
                token = req.headers.authorization.split(" ")[1];
            } else if (req.cookie?.jwt) {
                token = req.cookie.jwt;
                }
            if (!token || token === 'null') {
                return next(new AppError("You are not logged in", 500));
            }

            const decoded = process.env.JWT_SECRET ? JWT.verify(token, process.env.JWT_SECRET) : null;

            const currentUser = await UsersDBUtils.getUserById((decoded as TokenInterface).userId);
            if (!currentUser) {
                return next( new AppError( "The user associated with this token does no longer exist!", 500));
            }

            req.user = currentUser;

            next();
        }
        catch (err) {
            return next( new AppError( "The user associated with this token does no longer exist!" , 500));
        }
    };
}



module.exports = RouteValidation;

