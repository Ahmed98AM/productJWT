const AppError = require('../utils/appError');
const { promisify } = require("util");
const UsersDBUtils = require('../utils/db.users');
const JWT = require("jsonwebtoken");

class RouteValidation{
    static isLoggedIn = async function (req, res, next) {
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
                return next(
                new AppError("you are not logged in"), 500);
            }

            let decoded = await promisify(JWT.verify)(token, process.env.JWT_SECRET);

            const currentUser = await UsersDBUtils.getUserById(decoded.userId);
            if (!currentUser) {
                return next( new AppError( "The user associated with this token does no longer exist!"), 500);
            }

            req.user = currentUser;
            next();
        }
        catch (err) {
            return next( new AppError( "The user associated with this token does no longer exist!"), 500);
        }
    };
}



module.exports = RouteValidation;
