var _ = require('underscore');

const parseCookies = (req, res, next) => {
  let cookies = {};

  if (req.headers.cookie){
    _.each(req.headers.cookie.split('; '), function(cookieStr){
      var cookieKeyValue = cookieStr.split('=');
      cookies[cookieKeyValue[0]] = cookieKeyValue[1];
    });
  }
  req.cookies = cookies;
  next();
};

module.exports = parseCookies;