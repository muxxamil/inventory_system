import { Application } from 'express';
import passport from 'passport';
import * as passportConfig from '../config/passport';

export const register = (app: Application) => {

    app.get('/login', (req, res) => {
        res.send('<a href=\'/auth/github\'>Sign in With GitHub</a>')
    });

    app.get('/logout', (req, res) => {
        req.logOut();
        res.redirect('/login');
    });

    app.get('/auth/github', passport.authenticate('github'));

    app.get('/auth/github/callback', passport.authenticate('github', { failureRedirect: '/login' }), (req, res) => {
        res.redirect('/');
    });

    app.all('*', passportConfig.isAuthenticated);

    app.use('/', require('../controllers/File.controller'));
}