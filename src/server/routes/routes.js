const combineRouters = require('koa-combine-routers');
const indexRoutes = require('./index');
const movieRoutes = require('./movies');
const authRoutes = require('./auth');

const router = combineRouters([
  indexRoutes,
  movieRoutes,
  authRoutes
])

module.exports = router;