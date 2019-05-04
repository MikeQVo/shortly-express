const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');
app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));



app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// LOGIN AND SIGNUP
/************************************************************/

app.post('/login', (req, res, next) => {
  models.Users.get({username: req.body.username})
    .then(function(user) {
      if (models.Users.compare(req.body.password, user.password, user.salt)){
        let headers = {location: '/'};
        res.writeHead(200, headers);
        res.end();
      } else {
        let headers = {location: '/login'};
        res.writeHead(200, headers);
        res.end();
      }
    }).catch(function(err){
      let headers = {location: '/login'};
      res.writeHead(400, headers);
      res.end();
    });

});

app.post('/signup', (req, res, next) => {
  models.Users.get({ username: req.body.username})
    .then(function(user){
      if(user){
        let headers = {location: '/signup'};
        res.writeHead(200, headers);
        res.end();
      } else {
        models.Users.create({ username: req.body.username, password: req.body.password})
          .then(function(){
            let headers = {location: '/'};
            res.writeHead(200, headers);
            console.log('successful addition');
            res.end();
          })
          .catch(function(err){
            console.log('Errored out creating a user');
            res.writeHead(400);
            res.write(JSON.stringify(err));
            res.end();
          });
      }
    });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/



/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
