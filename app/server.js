const http = require('http');
const Router = require('router');
const finalhandler = require('finalhandler');

const db = require('./db');

const router = new Router();

require('./middleware')(router);
require('./routes')(router, db);

const server = http.createServer(function(req, res) {
  router(req, res, finalhandler(req, res));
});

module.exports = server;
