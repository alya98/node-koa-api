const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const session = require('koa-session');
const passport = require('koa-passport');

const router = require('./routes/routes');

const app = new Koa();
const PORT = process.env.PORT || 1337;

//sessions
app.keys = ['meow-meow'];
app.use(session(app));

app.use(bodyParser());

require('./auth');
app.use(passport.initialize());
app.use(passport.session());

app.use(router());

const server = app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}`);
});

module.exports = server;
