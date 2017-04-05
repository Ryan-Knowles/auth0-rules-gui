# auth0-rules-gui


## Auth0 Account configuration

1. Create a new web app client or have a web app client whose credentials the example will run under

2. Make sure the cors, callback, and logout settings are populated for the web app client
```
Allowed Callback URLs: http://localhost:3000/callback
Allowed Logout URLs: http://localhost:3000/logout
Allowed Origins (CORS): localhost:3000
```

3. Ensure the Auth0 Management API v2 is enabled in the API tab

4. Authorize the web app client to use this API by going to API -> Auth0 Management API -> Non Interactive Clients

5. Give the client the scopes:
```
rules:read
clients:read
```

6. Create a rule for the web app client to implement the whitelist using the following code:

```javascript
function (user, context, callback) {
  if (context.clientName === '<YOUR WEB APP CLIENTS NAME>') {
    var whitelist = [ '<WHITELISTED EMAILS>' ]; //authorized users
    var userHasAccess = whitelist.some(
      function (email) {
        return email === user.email;
      });

    if (!userHasAccess) {
      return callback(new UnauthorizedError('Access denied.'));
    }
  }

  callback(null, user, context);
}
```


## Running the Example

Install the dependencies.

```bash
npm install
```

Rename `.env.example` to `.env` and replace the values for `AUTH0_CLIENT_ID`, `AUTH0_DOMAIN`, and `AUTH0_CLIENT_SECRET` with your Auth0 credentials. If you don't yet have an Auth0 account, [sign up](https://auth0.com/signup) for free.

```bash
# copy configuration and replace with your own
cp .env.example .env
```

Run the app.

```bash
npm start
```

The app will be served at `localhost:3000`.


## Notes

1. The route '/' in index.js contains the example code for getting a management api v2 access token and requesting the client and rules data

2. The view index.pug demonstrates using the retrieved data to create a basic GUI for organizing the client and rule connections

3. New users can be added to the whitelist through their emails in the rule created above.


## License

This project is licensed under the MIT license. See the [LICENSE](LICENSE) file for more info.
