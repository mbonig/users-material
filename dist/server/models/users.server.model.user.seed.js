'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.removeAdmin = exports.removeUser = exports.seedAdmin = exports.seedUser = exports.getUsers = exports.init = undefined;

var _chalk = require('chalk');

var _chalk2 = _interopRequireDefault(_chalk);

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _config = require('modernMean/config');

var _config2 = _interopRequireDefault(_config);

var _usersServerModel = require('./users.server.model.user');

var _usersServerModel2 = _interopRequireDefault(_usersServerModel);

var _acl = require('../config/acl.js');

var _acl2 = _interopRequireDefault(_acl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let users = {};

let userTemplate = {
  email: 'user@localhost.com',
  name: {
    first: 'User',
    last: 'Local'
  }
};

let adminTemplate = {
  email: 'admin@localhost.com',
  name: {
    first: 'User',
    last: 'Admin'
  }
};

function removeUser() {
  let User = _usersServerModel2.default.getModels().user;
  users.user = undefined;
  return User.remove({ 'providers.email': userTemplate.email });
}

function removeAdmin() {
  let User = _usersServerModel2.default.getModels().user;
  users.admin = undefined;
  return User.remove({ 'providers.email': adminTemplate.email });
}

function getUser(template) {
  return new Promise((resolve, reject) => {
    let User = _usersServerModel2.default.getModels().user;

    User.findOne({ 'providers.email': template.email, 'providers.type': 'local' }).then(user => {
      if (!user) {
        resolve(new User(template));
      }
      resolve(user);
    });
  });
}

function seedUser() {
  return new Promise((resolve, reject) => {

    let LocalProvider = _usersServerModel2.default.getModels().provider;
    let Email = _usersServerModel2.default.getModels().email;

    let passwordPromise = LocalProvider.generateRandomPassphrase();
    let userPromise = getUser(userTemplate);

    Promise.all([passwordPromise, userPromise]).then(promises => {
      let user = promises[1];
      let password = promises[0];

      //Set email if its not set
      if (user.emails.length === 0) {
        let email = new _usersServerModel2.default.getModels().email({
          email: userTemplate.email,
          primary: true
        });
        user.emails.push(email);
      }

      //Set address if its not set
      if (user.addresses.length === 0) {
        let address = new _usersServerModel2.default.getModels().address({
          addressType: 'Shipping',
          streetAddress: '123 Bedrock',
          locality: 'Hollywood',
          region: 'CA',
          postalCode: '90210',
          country: 'US'
        });
        user.addresses.push(address);
      }

      //Remove Providers
      user.providers = [];
      //Set provider
      let provider = new LocalProvider({
        type: 'local',
        email: userTemplate.email,
        clearpassword: password
      });

      user.providers.push(provider);
      user.save().then(() => {

        _acl2.default.getAcl().addUserRoles(user._id.toString(), 'user');
        users.user = user.toObject();
        users.user.password = password;
        _winston2.default.info('Users::Model::Seed::User::' + _chalk2.default.bold.magenta(user.emails[0].email + ':' + password));
        resolve(user);
      });
      /*
      Commented out till i figure out how to mock it.
      .catch(err => {
        console.log(chalk.bold.red('Users::Model::Seed::User::Error::' + err));
        reject(err);
      });
      */
    });
  });
}

function seedAdmin() {
  return new Promise((resolve, reject) => {

    let LocalProvider = _usersServerModel2.default.getModels().provider;
    let Email = _usersServerModel2.default.getModels().email;

    let passwordPromise = LocalProvider.generateRandomPassphrase();
    let userPromise = getUser(adminTemplate);

    Promise.all([passwordPromise, userPromise]).then(promises => {
      let user = promises[1];
      let password = promises[0];

      //Set email if its not set
      if (user.emails.length === 0) {
        let email = new _usersServerModel2.default.getModels().email({
          email: adminTemplate.email,
          primary: true
        });
        user.emails.push(email);
      }

      //Remove Providers
      user.providers = [];
      //Set provider
      let provider = new LocalProvider({
        type: 'local',
        email: adminTemplate.email,
        clearpassword: password
      });

      user.providers.push(provider);

      user.save().then(() => {
        _acl2.default.getAcl().addUserRoles(user._id.toString(), ['admin']);
        users.admin = user.toObject();
        users.admin.password = password;
        _winston2.default.info('Users::Model::Seed::User::' + _chalk2.default.bold.magenta(user.emails[0].email + ':' + password));
        resolve(user);
      });
      /*
      Commented out till i figure out how to mock it.
      .catch(err => {
        console.log(chalk.bold.red('Users::Model::Seed::Admin::Error::' + err));
        reject(err);
      });
      */
    });
  });
}

function init() {
  return new Promise(function (resolve, reject) {

    if (users.admin !== undefined && users.user !== undefined) {
      return resolve(users);
    }

    _winston2.default.debug('Users::Model::Seed::Start');
    seedUser().then(seedAdmin).then(() => {
      _winston2.default.verbose('Users::Model::Seed::Success');
      resolve(users);
    });
    /*
    Commented out till i figure out how to mock it.
    .catch((err) => {
      console.log(chalk.bold.red('Users::Model::Seed::Error::' + err));
      reject(err);
    });
    */
  });
}

function getUsers() {
  return users;
}

let service = { init: init, getUsers: getUsers, seedUser: seedUser, seedAdmin: seedAdmin, removeUser: removeUser, removeAdmin: removeAdmin };

exports.default = service;
exports.init = init;
exports.getUsers = getUsers;
exports.seedUser = seedUser;
exports.seedAdmin = seedAdmin;
exports.removeUser = removeUser;
exports.removeAdmin = removeAdmin;