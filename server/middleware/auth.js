const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {
  var session = {};

  if(req.cookies){
    //session already exists
  } else {
    //if no cookie create session
    models.Sessions.create()
      .then(function(data){
        console.log('----------->RETURNED DATA:',data);
      });
  }

  req.session = session;
  next();
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

