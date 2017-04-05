var express = require('express');
var passport = require('passport');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn();
var router = express.Router();
var rp = require('request-promise');
var Promise = require('bluebird');
var _ = require('lodash');

var env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
};

// Render main Client-Rules display, protected from unauthorized access_token
router.get('/', ensureLoggedIn, function(req, res, next) {
  // Recommend a system to store the token and refresh as needed instead of creating
  // a new one each time.
  const tokenOptions = {
    method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: {
      'content-type': 'application/json'
    },
    body: {
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: `https://${process.env.AUTH0_DOMAIN}/api/v2/`
    },
    json: true 
  };

  // Request Token
  rp(tokenOptions).then( function(body) {
    const access_token = body.access_token;

    const clientOptions = {
      method: 'GET',
      url: `https://${process.env.AUTH0_DOMAIN}/api/v2/clients`,
      headers: {
        authorization: `Bearer ${access_token}`,
        'content-type': 'application/json'
      },
      json: true
    };

    const rulesOptions = {
      method: 'GET',
      url: `https://${process.env.AUTH0_DOMAIN}/api/v2/rules`,
      headers: {
        authorization: `Bearer ${access_token}`,
        'content-type': 'application/json'
      },
      json: true
    };

    return Promise.all( [rp(clientOptions), rp(rulesOptions)] );
  })
  .then( function(responses) {
    let clients = _.map(responses[0], (el) => {
      return {
        name: el.name,
        description: el.description,
        client_id: el.client_id
      }
    });
    // Find clientName comparisons
    let nameRegex = /\.clientName\s*(?:==|===)\s*['"]([\w-]+)['"]/g;

    // Find clientID comparisons
    let idRegex = /\.clientID\s*(?:==|===)\s*['"]([\w-]+)['"]/g;

    let rules = _.map(responses[1], (el) => {
      el.clients = [];
      
      let client;
      
      while(client = nameRegex.exec(el.script) ) el.clients.push(client[1]);

      while(client = idRegex.exec(el.script) ) el.clients.push(client[1]);
      
      return el;
    });

    res.render('index', { title: 'Auth0 Client-Rules GUI Demo', user: req.user, clients: clients, rules: rules });
  })
  .catch( function(err) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
});

router.get('/login',
  function(req, res){
    res.render('login', { env: env });
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

router.get('/callback',
  passport.authenticate('auth0', { failureRedirect: '/url-if-something-fails' }),
  function(req, res) {
    res.redirect(req.session.returnTo || '/user');
  });

module.exports = router;
