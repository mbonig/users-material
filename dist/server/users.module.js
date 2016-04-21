'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.init = undefined;

var _winston = require('winston');

var _winston2 = _interopRequireDefault(_winston);

var _usersServerModel = require('./models/users.server.model.user');

var _usersServerModel2 = _interopRequireDefault(_usersServerModel);

var _usersServerModelUser = require('./models/users.server.model.user.seed');

var _usersServerModelUser2 = _interopRequireDefault(_usersServerModelUser);

var _usersServer = require('./routes/users.server.routes');

var _usersServer2 = _interopRequireDefault(_usersServer);

var _authServer = require('./routes/auth.server.routes');

var _authServer2 = _interopRequireDefault(_authServer);

var _authentication = require('./authentication/authentication');

var _authentication2 = _interopRequireDefault(_authentication);

var _config = require('modernMean/config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function init(app) {
  _winston2.default.debug('Users::Init::Start');

  let modelInit = new Promise(function (resolve, reject) {
    _winston2.default.debug('Users::Init::Model::Start');
    _usersServerModel2.default.init().then(function (model) {
      if (_config2.default.seedDB) {
        _usersServerModelUser2.default.init();
      }
      _winston2.default.verbose('Users::Init::Model::Success');
      return resolve();
    }).catch(function (err) {
      _winston2.default.error(err);
      return reject(err);
    });
  });

  let expressInit = new Promise(function (resolve, reject) {
    _winston2.default.debug('Users::Init::Express::Start');
    _authentication2.default.init(app).then(_usersServer2.default.init).then(_authServer2.default.init).then(function () {
      _winston2.default.verbose('Users::Init::Success');
      return resolve(app);
    }).catch(function (err) {
      _winston2.default.error('Users::Init::Error::' + err);
      return reject(err);
    });
  });

  return Promise.all([modelInit, expressInit]);
}

let service = { init: init };

exports.default = service;
exports.init = init;