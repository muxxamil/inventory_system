import express from 'express';
import { sequelize } from './models';
import * as routes from './config/routes';
import passport from 'passport';
import session from 'express-session';

const app = express();
const port = process.env.PORT || '8000';

app.use('/public', express.static('public'));

app.use(
  session({ secret: process.env.APP_SECRET, resave: true, saveUninitialized: true })
)

app.use(passport.initialize());
app.use(passport.session());

sequelize.authenticate();

app.set('view engine', 'pug');

routes.register(app);

app.listen(port, () => {
  // tslint:disable-next-line
  return console.log(`Server is listening on ${port}`);
});
