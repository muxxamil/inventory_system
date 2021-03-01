import passport from 'passport';
import { isEmpty } from 'lodash';
import { Strategy } from 'passport-github';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User.model';

passport.serializeUser<any, any>((req, user, done) => {
    done(null, user);
});

passport.deserializeUser(async (obj, done) => {
    done(null, obj);
});

passport.use(new Strategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.PASSPORT_AUTH_CALLBACK
},
async (accessToken, refreshToken, profile, cb) => {
    try {
        let userObj = await User.findOne({ where: { githubId: profile.id, name: profile.username } });

        if (isEmpty(userObj)) {
            userObj = await User.create({ githubId: profile.id, name: profile.username });
        }

        return cb(null, userObj.id);
    } catch (error) {
        return cb(error, null);
    }
}));

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
};