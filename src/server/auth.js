const passport = require('koa-passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');

const knex = require('./db/connection');

const options = {};

passport.serializeUser((user, done) => { done(null, user.id); });

passport.deserializeUser((id, done) => {
  return knex('users').where({id}).first()
  .then((user) => {console.log(user); done(null, user); })
  .catch((err) => { done(err,null); });
});

passport.use(new LocalStrategy(options, (username, password, done) => {
  knex('users').where({ username }).first()
  .then((user) => {
    if (!user) return done(null, false);
    if (comparePass(password, user.password)) {
      return done(null, user);
    } else {
      return done(null, false);
    }
  })
  .catch((err) => { return done(err); });
}));

function comparePass(userPassword, databasePassword) {
  return bcrypt.compareSync(userPassword, databasePassword);
}