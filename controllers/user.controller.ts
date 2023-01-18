import {Response, Request, NextFunction } from "express"
import { AppError } from '../utils/appError';
import bcrypt from 'bcryptjs';
import JWT from 'jsonwebtoken';
import { UsersDBUtils } from '../utils/db.users';


interface User {
    id: string | number
}

const createToken = function (user: User, statusCode: number, res: Response) {

    const userId = user.id;
    if (!process.env.JWT_SECRET || !process.env.JWT_COOKIE_EXPIRES_IN) throw (new AppError("Something went wrong!", 500));  
    
    const token = JWT.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_DURATION,
    });

    const cookieExpireTime = process.env.JWT_COOKIE_EXPIRES_IN ? Number(process.env.JWT_COOKIE_EXPIRES_IN) * 24 * 60 * 60 * 1000 : 0;
    const cookieOptions = {
        expires: new Date(
            Date.now().valueOf() + cookieExpireTime
        ),
        httpOnly: true,
    };
    res.cookie("jwt", token, cookieOptions);

    res.status(statusCode).json({
        status: "success",
        token,
        user,
    });

    return token;
};

const signUp = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { username, email, password } = req.body;

        if (!email?.trim() || !password?.trim() || !username?.trim()) {
            return next(new AppError("Some required data is missing", 400));               
        }
        
        const foundUser = await UsersDBUtils.getUserBy({ email });
        if (foundUser) return next(new AppError("User found with the same email!", 409));
        
        const createdUser = await UsersDBUtils.createUser({
            username, email, password
        });
        if (!createdUser) return next(new AppError("Something went wrong", 500));

        createToken(createdUser, 201, res);
        
    } catch (err) {
        next(err);
    }
};

const logIn = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const { email, password } = req.body;
        
        if (!email?.trim() || !password?.trim()) {
            return next(new AppError("Some required data is missing", 400));               
        }

        const foundUser = await UsersDBUtils.getUserBy({ email });
        if (!foundUser) return next(new AppError("Incorrect email or password", 400));

        const isPasswordCorrect = await bcrypt.compare(password, foundUser.hash);

        if (isPasswordCorrect) {
            createToken(foundUser, 200, res);
        } else {
            return next(new AppError("Incorrect email or password", 400));                            
        };

    } catch (err) {
        next(err);
    }
};

const logOut = async (req: Request, res: Response, next: NextFunction) => {
    
    try {
        const logoutTokenOptions= (isCookie: boolean)=> {
            return isCookie? { expires: new Date(Date.now() + 10 * 1000) }: { expiresIn: "1" } 
        };

        res.cookie("jwt", "nothingToken", logoutTokenOptions(true));

        return res.status(200).send({ status: 'success', token: null })
        
    } catch (err) {
        next(err);
    }

};




export { signUp, logIn, logOut};
