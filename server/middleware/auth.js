const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  if (Object.keys(req.cookies).length > 0 && req.cookies) {
    models.Sessions.get({ hash: req.cookies.shortlyid })
      .then(function(session) {
        if (session) {
          req.session = session;
        } else {
          models.Sessions.create(function(hash){
            req.session = { hash: hash };
            res.cookie('shortlyid', hash);
          });
        }
        next();
      })
      .catch(function(err) {
        console.log('------> WE HIT AN ERROR 1');

        next();
      });
  } else {
    models.Sessions.create(function(hash) {
      req.session = { hash: hash };
      res.cookie('shortlyid', hash);
    })
      .then(function() {
        next();
      })
      .catch(function(err) {
        console.log('-------> WE HIT AN ERROR 2');
        next();
      });
  }
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

module.exports.verifySession = (req, res, next) => {
  if(!models.Sessions.isLoggedIn(req.session)){
    res.redirect('/login');
  } else {
    next();
  }
};