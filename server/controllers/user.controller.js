const UsersDBUtils = require('../utils/db.users')
const AppError = require('../utils/appError');
const bcrypt = require('bcryptjs');
const JWT = require("jsonwebtoken");


const createToken = function (user, statusCode, res) {
  const userId = user.id;
  const token = JWT.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DURATION,
  });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
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

const signUp = async (req, res, next) => {
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

const logIn = async (req, res, next) => {
    try {
        const {email, password } = req.body;
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

const logOut = async (req, res, next) => {
    
    try {
        const logoutTokenOptions= (isCookie)=> {
            return isCookie? { expires: new Date(Date.now() + 10 * 1000) }: { expiresIn: "1" } 
        };
        res.cookie("jwt", "nothingToken", logoutTokenOptions(true));
        return res.status(200).send({status: 'success', token: null })
    } catch (err) {
        next(err);
    }

};




module.exports = { signUp, logIn, logOut};
