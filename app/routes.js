const Promise = require('bluebird');

module.exports = function(router, db) {
  router.get('/', function(req, res) {
    if (req.session.user) {
      return res.redirect('/welcome');
    }

    res.render('auth.ejs');
  });

  router.get('/welcome', function(req, res) {
    if (!req.session.user) {
      return res.redirect('/register');
    }

    res.render('welcome.ejs');
  });

  router.get('/register', function(req, res) {
    if (req.session.user) {
      return res.redirect('/welcome');
    }

    res.render('auth.ejs');
  });

  router.post('/register', function(req, res) {
    const params = req.body;

    Promise.resolve()
      .then(function() {
        return db.isUserParamsValid(params);
      })
      .then(function() {
        return db.createUser(params);
      })
      .then(function(user) {
        // delete user password
        delete user.password;

        req.session.user = user;

        res.redirect('/edit');
      })
      .catch(function(error) {
        res.render('auth.ejs', { error });
      });
  });

  router.post('/social_register', function(req, res) {
    const params = req.body;

    Promise.resolve()
      .then(function() {
        return db.isUserParamsValid(params, { isValidatePassword: false });
      })
      .then(function() {
        return db.createUser(params);
      })
      .then(function(user) {
        // delete user password
        delete user.password;

        req.session.user = user;
        req.session.isSocialRegister = true;

        res.json({
          status: 'success'
        });
      })
      .catch(function(error) {
        res.json({
          status: 'error',
          error: error.message
        });
      });
  });

  router.get('/login', function(req, res) {
    if (req.session.user) {
      return res.redirect('/welcome');
    }

    res.render('auth.ejs');
  });

  router.post('/login', function(req, res) {
    const params = req.body;

    Promise.resolve()
      .then(function() {
        return db.login(params);
      })
      .then(function(user) {

        // delete user password
        delete user.password;

        req.session.user = user;

        res.redirect('/welcome');
      })
      .catch(function(error) {
        res.render('auth.ejs', { error });
      });
  });

  router.post('/social_login', function(req, res) {
    const params = req.body;

    params.isLoginBySocial = true;

    Promise.resolve()
      .then(function() {
        return db.login(params);
      })
      .then(function(user) {

        // delete user password
        delete user.password;

        req.session.user = user;

        res.json({
          status: 'success'
        });
      })
      .catch(function(error) {
        res.json({
          status: 'error',
          message: error.message
        });
      });
  });

  router.get('/edit', function(req, res) {
    const { isSocialRegister } = req.session;

    return res.render('edit.ejs', { isSocialRegister });
  });

  router.post('/edit', function(req, res) {
    const params = req.body;
    const { isSocialRegister } = req.session;

    Promise.resolve()
      .then(function() {
        let isValidatePassword = false;

        if (isSocialRegister) {
          isValidatePassword = true;
        }

        return db.isUserParamsValid(params, { isValidatePassword });
      })
      .then(function() {
        req.session.user.fullname = params.fullname;

        return db.editUser(params);
      })
      .then(function() {
        res.redirect('/welcome');
      })
      .catch(function(error) {
        console.log(error.stack);
        res.render('edit.ejs', { error, isSocialRegister });
      });
  });

  router.get('/users', function(req, res) {
    return db.getAllUsers()
      .then(function(users) {
        return res.json(users);
      })
      .catch(function(error) {
        return Promise.reject(error);
      });
  });
};
