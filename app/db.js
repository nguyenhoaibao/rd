const Promise = require('bluebird');
const mongoose = require('mongoose');

const User = require('./models/User');
const util = require('./util');

const MONGO_HOST = util.getEnv('MONGO_HOST');
const MONGO_PORT = util.getEnv('MONGO_PORT');
const MONGO_DB = util.getEnv('MONGO_DB');

mongoose.connect(`mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DB}`);

module.exports = {
  getAllUsers() {
    return new Promise(function(resolve, reject) {
      User.find({}, function(error, users) {
        if (error) {
          return reject(error);
        }

        resolve(users);
      });
    });
  },

  findUserByEmail(email) {
    return new Promise(function(resolve, reject) {
      User.findOne({ email }, function(error, user) {
        if (error) {
          return reject(error);
        }

        resolve(user);
      });
    });
  },

  findUserByFbId(id) {
    return new Promise(function(resolve, reject) {
      User.findOne({ 'facebook.id': id }, function(error, user) {
        if (error) {
          return reject(error);
        }

        resolve(user);
      });
    });
  },

  saveUser(params) {
    const user = new User();
    const { email, fullname, password } = params;

    user.email = email;
    user.fullname = fullname;

    if (password) {
      user.password = User.hash(password);
    }

    if (params.source) {
      user[params.source] = {
        id: params.id,
        email: params.email,
        token: params.token,
        expired: params.expired
      };
    }

    return new Promise(function(resolve, reject) {
      user.save(function(error) {
        if (error) {
          return reject(error);
        }

        resolve(user);
      });
    });
  },

  createUser(params) {
    const _this = this;
    const { email } = params;

    return this.findUserByEmail(email)
      .then(function(user) {
        if (user) {
          return Promise.reject(new Error(`Email ${params.email} already exists`));
        }

        return _this.saveUser(params);
      })
      .catch(function(error) {
        return Promise.reject(error);
      });
  },

  editUser(params) {
    const _this = this;
    const { email, fullname, password } = params;

    const updatedUser = {
      fullname
    };

    if (password) {
      updatedUser.password = User.hash(password);
    }

    return new Promise(function(resolve, reject) {
      User.update({ email }, updatedUser, function(error) {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    });
  },

  login: function(params) {
    const { email, password, isLoginBySocial } = params;

    if (isLoginBySocial) {
      return this.loginBySocial(params);
    }

    return this.findUserByEmail(email)
      .then(function(user) {
        if (!user) {
          return Promise.reject(new Error(`Email ${email} does not exist`));
        }

        if (!User.validatePassword(password, user.password)) {
          return Promise.reject(new Error('Password does not valid'));
        }

        return user;
      })
      .catch(function(error) {
        return Promise.reject(error);
      });
  },

  loginBySocial: function(params) {
    const { socialSource } = params;

    switch (socialSource) {
      case 'facebook':
        return this.loginByFbId(params);
      default:
        return Promise.reject(new Error('Source is required'));
    }
  },

  loginByFbId: function(params) {
    const { id } = params;

    return this.findUserByFbId(id)
      .then(function(user) {
        if (!user) {
          return Promise.reject(new Error(`Id ${id} does not exist`));
        }

        return user;
      })
      .catch(function(error) {
        return Promise.reject(error);
      });
  },

  isUserParamsValid(params, options = {}) {
    const isValidatePassword = options.isValidatePassword !== undefined ?
      options.isValidatePassword :
      true;

    if (!params.email) {
      return Promise.reject(new Error('Email is required'));
    }

    if (!params.fullname) {
      return Promise.reject(new Error('Fullname is required'));
    }

    if (isValidatePassword) {
      if (!params.password) {
        return Promise.reject(new Error('Password is required'));
      }

      if (!params.rePassword) {
        return Promise.reject(new Error('Repeat password is required'));
      }

      if (params.password !== params.rePassword) {
        return Promise.reject(new Error('Password and Repeat password does not match'));
      }
    }

    return Promise.resolve();
  }
};
