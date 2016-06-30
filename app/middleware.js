const fs = require('fs');
const path = require('path');
const qs = require('querystring');
const view = require('consolidate');
const assign = require('lodash.assign');
const session = require('client-sessions');

const util = require('./util');

module.exports = function(router) {
  // serve static files
  router.use(function(req, res, next) {
    const url = req.url;

    if (url.indexOf('.css') === -1 && url.indexOf('.js') === -1) {
      return next();
    }

    const file = path.join(__dirname, '..', url);

    fs.readFile(file, function(error, data) {
      if (error) {
        return next(error);
      }

      res.writeHead(200);
      res.end(data);
    });
  });

  router.use(session({
    cookieName: util.getEnv('COOKIE_NAME'),
    secret: util.getEnv('COOKIE_SECRET'),
    duration: util.getEnv('COOKIE_DURATION')
  }));

  router.use(function(req, res, next) {
    res.locals = res.locals || {};
    next();
  });

  router.use(function(req, res, next) {
    if (req.session && req.session.user) {
      res.locals.user = req.session.user;
    }

    next();
  });

  router.use(function(req, res, next) {
    res.redirect = function(url) {
      res.setHeader('Location', url);
      res.statusCode = 301;
      res.end();
    };

    next();
  });

  router.use(function(req, res, next) {
    res.setHeader('Content-Type', 'text/html; charset=utf8');

    res.render = function(filename, params) {
      let file = path.resolve(__dirname, '../views', filename);

      const _params = assign(params || {}, res.locals || {});

      view.ejs(file, _params, function(error, html) {
        if (error) {
          return next(error);
        }

        res.end(html);
      });
    };

    next();
  });

  router.use(function(req, res, next) {
    res.json = function(params) {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(params));
    };

    next();
  });

  router.use(function(req, res, next) {
    req.body = {};

    if (req.method !== 'POST') {
      return next();
    }

    let body = '';

    req.on('data', function(buffer) {
      body += buffer.toString();
    });

    req.on('end', function() {
      req.body = qs.parse(body);
      next();
    });
  });
};
