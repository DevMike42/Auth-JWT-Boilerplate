# NodeJS Setup

## Overview
Basic steps for setting up a backend Node application that includes User Login and Authentication using ***bcryptjs*** and ***jsonwebtoken***


## Steps
1. Generate a `package.json` and complete description fields
    ```console
    npm init
    ```
    or generate a pre-completed `package.json`
    ```console
    npm init -y
    ```

2. Install Dependencies
    * express
    * express-validator
    * jsonwebtoken
    * config
    * mongoose
    * dotenv

3. Install Dev Dependencies
    * nodemon

4. Add scripts to `package.json`
    ``` json
    "scripts": {
      "start": "node server.js",
      "server": "npx nodemon server.js"
      }
    ```

5. Create `server.js` file as entrypoint to back-end and create basic express server
    ``` js
    const express = require('express');

    // Initialized express
    const app = express();

    // Init Middleware to accept json data in req.body
    app.use(express.json({ extended: false }));

    // Root route
    app.get('/', (req, res) => res.json({ msg: 'Welcome to the User Auth API...' }));

    // Looks for PORT in env (for production mode) or uses 5000
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, console.log(`Server started on port: ${PORT}`));
    ```

6. Test express server using `server` script as well as with Postman
    ```console
    npm run server
    ```

7. Create basic routes

    * Create a `routes` folder in the root directory
    * Create files `user.js` and `auth.js`
    * Pull routes files into `server.js` and define them
      ``` js
      // Define routes
      app.use('/api/users', require('./routes/users'));
      app.use('/api/auth', require('./routes/auth'));
      ```
    * Create basic routes in `users.js` (Send messages for testing)
      ```js
      const express = require('express');
      const router = express.Router();

      // @route         GET api/users/:id
      // @description   Get logged in User info
      // @access        Private
      router.get('/:id', (req, res) => {
        res.send('Get logged in User Info');
      });

      // @route         POST api/users
      // @description   Register a User
      // @access        Public
      router.post('/', (req, res) => {
        res.send('Register a User');
      });

      // @route         PUT api/users/:id
      // @description   Update User info
      // @access        Private
      router.put('/:id', (req, res) => {
        res.send('Update User info');
      });

      // @route         DELETE api/users/:id
      // @description   Delete a User
      // @access        Private
      router.delete('/:id', (req, res) => {
        res.send('Delete a User');
      });

      module.exports = router;
      });

      module.exports = router;
      ```
    * Create basic routes in `auth.js` (Send messages for testing)
      ```js
      const express = require('express');
      const router = express.Router();

      // @route         GET api/auth
      // @description   Get logged in User
      // @access        Private
      router.get('/', (req, res) => {
        res.send('Get logged in User');
      });

      // @route         POST api/auth
      // @description   Auth user & get token
      // @access        Public
      router.post('/', (req, res) => {
        res.send('Log in User');
      });

      module.exports = router;
      ```
    * Test endpoints with Postman

8. Connect MongoDB

    * Create a `.env` file to safely store MongoDB URI
      ```js
      MONGODB_URI="mongodb+srv://mike123:mike123@authjwt-wn8cx.mongodb.net/<dbname>?retryWrites=true&w=majority"
      ```
    * Create `config` folder in root directory
    * Create `db.js` file inside `config` folder and add code to connect to MongoDB
      ```js
      const mongoose = require('mongoose');
      require('dotenv').config();

      const MONGODB_URI = process.env.MONGODB_URI;

      const connectDB = async () => {
        try {
          await mongoose
            .connect(MONGODB_URI, {
              useNewUrlParser: true,
              useCreateIndex: true,
              useFindAndModify: false,
              useUnifiedTopology: true
            });
          console.log('MongoDB Connected');
        } catch (err) {
          console.error(err.message);
          process.exit(1);
        }
      };

      module.exports = connectDB;
      ```
    * Inside `server.js`, bring in the `config/db.js` file and call the `connectDB` function
      ```js
      const connectDB = require('./config/db');

      // Connect MongoDB
      connectDB();
      ```
    * Test connection using `server` script
      ```console
      npm run server
      ```

9. Create the Model for a User

    * Create a `models` folder inside the root directory
    * Inside the `models` folder, create a file called `User.js`
    * Inside `User.js`, create the model for a User
      ```js
      const mongoose = require('mongoose');

      const UserSchema = mongoose.Schema({
        username: {
          type: String,
          required: true,
          unique: true
        },
        email: {
          type: String,
          required: true,
          unique: true
        },
        fullName: {
          type: String,
          required: true
        },
        password: {
          type: String,
          required: true
        },
        date: {
          type: Date,
          default: Date.now
        }
      });

      module.exports = mongoose.model('user', UserSchema);
      ```

10. Start to create the POST route for creating a User

    * Inside the `users.js` file inside the `routes` folder, bring in `express-validator`
      ```js
      const { check } = require('express-validator');
      ```
    * Create the validation checks on user input and add a callback function for the `create` method from the `userController` ***(to be created later)***
      ```js
      router.route('/')
      .post([
        // Validation checks on user input using express-validator
        check('username', 'Please add a name')
          .not()
          .isEmpty(),
        check('email', 'Please include a valid email')
          .isEmail(),
        check('password', 'Please enter a password with 6 or more characters')
          .isLength({ min: 6 })
      ], usersController.create);
      ```
    * Bring in the User Controller 
      ```js
      const usersController = require('../controllers/users');
      ```

11. Create the User Controller for accessing MongoDB

    * Create a `controllers` folder in the root directory
    * Inside the `controllers` folder, create a file titled `users.js`
    * Inside the `users.js`, bring in the User Model
      ```js
      const User = require('../models/User');
      ```
    * Bring in `express-validator` for checking validation on user input
      ```js
      const { validationResult } = require('express-validator');
      ```
    * Bring in `bcrypt` for hashing the password before saving to db
      ```js
      const bcrypt = require('bcryptjs');
      ```
    * Make the `create` method for adding the user data to the DB (
      ```js
        module.exports = {
          create: async (req, res) => {

            // Checks if validation checks are empty
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(400).json({ errors: errors.array() });
            }

            // Destructure needed input from req.body
            const { username, email, fullName, password } = req.body;

            try {

              // Check if username is already in db
              let user = await User.findOne({ username: username });
              if (user) {
                return res.status(400).json({ msg: 'User already exists' });
              }

              // Create new instance of a User
              user = new User({
                username: username,
                email: email,
                fullName: fullName,
                password: password
              });

              // Generate a salt for hashing password
              const salt = await bcrypt.genSalt(10);

              // Hash password using bcryptjs to be stored in DB
              user.password = await bcrypt.hash(password, salt);

              // Save user to DB
              await user.save();

              // Temporary
              res.send('User Saved');

            } catch (err) {
              console.error(err);
              res.status(500).send('Server Error');
            }
          }
        };
      ```
    * Test Validation Input and test that user is being saved in DB with Postman

12. Authenticate a user with JSON Web Token

    * Inside `users.js` inside the `controllers` folder, bring in `jsonwebtoken`
      ```js
      const jwt = require('jsonwebtoken');
      ```
    * Remove temporary `res.send()` 
      ```js
      // Temporary
      res.send('User Saved');
      ```
    * Create the payload to be sent with the `JSON Web Token` (Only need to send a user object with the `id` of the user)
      ```js
      // Store user id in jwt payload
      const payload = {
        user: {
          id: user.id
        }
      };
      ```
    * Sign the web token with a `secret` (Need to save secret in `.env` file for safety *see next step)
      ```js
      // Add payload and jwtSecret to token and send back
      jwt.sign(payload, JWT_SECRET, {
        expiresIn: 3600
      }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
      ```
    * Bring in `dotenv` to gain access to JWT_SECRET saved in `.env` and store it in a variable
      ```js
      require('dotenv').config();

      const JWT_SECRET = process.env.JWT_SECRET;
      ```
    * Add the `JWT_SECRET` to the `.env` file (Whatever you want it to be)
      ```js
      JWT_SECRET="imasecret"
      ```
    * Test the POST request to /api/users with Postman. It should send back a JWT and save the user in the db
      ```json
      {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVlNmRkYjllYzYxNWY0ZGEzYjA1MDc1In0sImlhdCI6MTU5MjE4ODM0NSwiZXhwIjoxNTkyMjI0MzQ1fQ.ZTETUDJ15cwOhQioqaHOf_Ew4T1ta3mNfTStoHgYT00"
      }
      ```

13. Work on the `auth post` route for loggin in and authenticating a user

    * Bring in necessary items to for access
      ```js
      const { check } = require('express-validator');
      ```
    * Remove the temporary `res.send` in the route
      ```js
      // Temporary
      res.send('Log in User');
      ```
    * Add validation checks on user input as the second argument in the `post` method
      ```js
      router.post('/', [
        // Validation checks on user input using express-validator
        check('username', 'Please include a valide username')
          .exists(),
        check('password', 'Password is required')
          .exists()
      ],
      ```
    * Add the callback function titled `authController.assignToken` as the third arguement to the `post` method (cb and controller to be made later)
      ```js
      router.post('/', [
        // Validation checks on user input using express-validator
        check('username', 'Please include a valide username')
          .exists(),
        check('password', 'Password is required')
          .exists()
      ], authController.assignToken);
      ```
    * Create a file in the `controllers` folder title `auth.js`
    * Bring in the necessary items for access and store the `JWT_SECRET` in a variable
      ```js
      require('dotenv').config();
      const bcrypt = require('bcryptjs');
      const jwt = require('jsonwebtoken');
      const { validationResult } = require('express-validator');
      const User = require('../models/User');

      const JWT_SECRET = process.env.JWT_SECRET;
      ``` 
    * Create an exported function titled `assignToken` that handles the `request` and `response`
      ```js
      module.exports = {
        assignToken: async (req, res) => {

        }
      }
      ```
    * Inside the `assignToken` function add validation checks to ensure the `req` does not include an errors array
      ```js
      // Checks if validation checks are empty
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      ```
    * Destructure the `username` and `password` from the req.body
      ```js
      // Destructure username & password from req.body
      const { username, password } = req.body;
      ```
    * Inside of a try/catch
        * Access the db by the `username`
        * Check if the user is registered
        * If not, return a json msg stating invalide credentials
        * If so, use `bcryptjs` to compare the password to the one saved in db 
        * If password is incorrect, return a json msg stating password is incorrect
        * Otherwise, store the `user id` in the payload and send back a `jwt` 
        ```js
        // Check if user is registered
        try {
          let user = await User.findOne({ username: username });

          if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials: A user with that username does not exist' });
          }

          // If registered > check if password input matches stored data
          const isMatch = await bcrypt.compare(password, user.password);

          // If password is incorrect > send error message
          if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials: Password is incorrect' });
          }

          // If registers and password matches > login and return token
          // Store user id in jwt payload
          const payload = {
            user: {
              id: user.id
            }
          };

          // Add payload and jwtSecret to token and send back
          jwt.sign(payload, JWT_SECRET, {
            expiresIn: 36000
          }, (err, token) => {
            if (err) throw err;
            res.json({ token });
          });

        } catch (err) {
          console.error(err.message);
          res.status(500).send('Server Error');
        }
        ```
    * Run the server and test the `Auth` `Post` route for logging in a user. 
        * Headers - Content-Type: application/json
        * Body - Raw JSON
          ```json
          {
            "username": "tinyrick",
            "password": "123456"
          }
          ```
        * Should respond with a token
          ```json
          {
            "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImlkIjoiNWVlNmRkYjllYzYxNWY0ZGEzYjA1MDc1In0sImlhdCI6MTU5MjI2MzMyOCwiZXhwIjoxNTkyMjk5MzI4fQ.Y42onD4UBtW6xyo980IgCqLagBAlMypd62kq3PhV5Ho"
          }
          ```

14. Create Auth Middlware for sending token to protect private routes

    * Create a folder in the root directory titled `middlware`
    * Create a file in that folder titled `auth.js`
    * Bring in `dotenv`, `jsonwebtoken`, and set the variable for the `JWT_SECRET`
      ```js
      require('dotenv').config();
      const jwt = require('jsonwebtoken');

      const JWT_SECRET = process.env.JWT_SECRET;
      ```
    * Create an exported function that takes in `request`, `response`, and `next`. The `next` parameter is a function that says whenever you're done, move on to the next piece of middleware.
      ```js
        module.exports = function(req, res, next) {
        
        };
      ```
    * Access the token from the header in the request
      ```js
      // Get token from header
      const token = req.header('x-auth-token');
      ```
    * Check if token exists (If no, return json msg)
      ```js
      // Check if no token exists
      if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }
      ```
    * Verify token
      ```js
      // Verify token
      try {
        // Stores payload with user and token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Assigns req.user to payload
        req.user = decoded.user;
        next();
      } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
      }
      ```
    * Inside the folder `routes`, inside `auth.js`, bring in the auth middleware we just made
      ```js
      const auth = require('../middleware/auth');
      ``` 
    * Inside the `GET` route, add `auth` as a 2nd argument
      ```js
      router.get('/', auth, (req, res) => {
        res.send('Get logged in User');
      });
      ```
    * Test `Auth GET` route with Postman for getting the logged in user `with and without a token`
        * Headers - x-auth-token: >token value<
        * Body - None
        * Without token, response should be denied authorization message
          ```json
          {
            "msg": "No token, authorization denied"
          }
          ```
        * With token, response should be `Get logged in User` string from temporary `res.send`
        
15. Work on the `confirmToken` method inside `authController` for verifying a token

    * Replace the cb function inside the `auth get` route with the `authController` method `confirmToken` (To be made later)
      ```js
      router.get('/', auth, authController.confirmToken);
      ```
    * Inside the `controllers` folder, inside the `auth.js` file, add an exported asynchronous method to the the auth controller titled, `confirmToken` that handles the request and response
      ```js
      confirmToken: async (req, res) => {
        
      }
      ```
    * Inside the `confirmToken` method add a try/catch. The token being sent with the `auth` middleware will contain a user with the `user id`. Find the user by id and return the user (minus the password from the db)
      ```js
      try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
      ```
    * Test the `auth GET` route with Postman with and without a token
        * Headers - x-auth-token: >token value<
        * Body - None
        * Without token, response should be denied authorization message
          ```json
          {
            "msg": "No token, authorization denied"
          }
          ```
        * With token, response should be a json object with the logged in user info (minus the password)
          ```json
          {
            "_id": "5ee6ddb9ec615f4da3b05075",
            "username": "tinyrick",
            "email": "tinyrick@examples.com",
            "fullName": "Rick Sanchez C137",
            "date": "2020-06-15T02:32:25.585Z",
            "__v": 0
          }
          ```

16. Work on adding funcitonality for a User to update his/her account info

    * Inside the `routes` folder, inside `users.js`, bring in the `auth` middleware to protect the `put` route
      ```js
      const auth = require('../middleware/auth');
      ```
    * Add `auth` as a 2nd arguement to the `put` route as well as a `usersController.updateUser` method as a 3rd argument (Note: to be made later)
      ```js
      router.put('/:id', auth, usersController.updateUser);
      ```
    * Inside the `controllers` folder, inside the `user.js` file, add a new exported asynchronous method title `updateUser`
      ```js
      updateUser: async (req, res) => {}
      ```
    * Destructure the user info fields from `req.body`
      ```js
          const { username, email, fullName, password } = req.body;
      ```
    * Create a new object to store the new user info coming in from the user
      ```js
      const updatedUser = {};
      if (username) updatedUser.username = username;
      if (email) updatedUser.email = email;
      if (fullName) updatedUser.fullName = fullName;
      if (password) updatedUser.password = password;
      ```
    * Inside of a `try/catch`, locate the user in the db by `id` and set all the new info to the value of `updatedUser`
      ```js
      try {
        let user = await User.findById(req.params.id);

        user = await User.findByIdAndUpdate(req.params.id,
          { $set: updatedUser },
          { new: true });

        res.json({ msg: 'User info updated successfully!' });
      } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
      }
      ```
    * Test the route with Postman
        * Headers - Content-Type: application/json | x-auth-token: >validtoken<
        * Body - Raw json containing all new fields
          ```json
          {
            "username": "tinyrick",
            "email": "tinyrick@examples.com",
            "fullName": "Rick Sanchez C137",
            "password": "444444"
          }
          ```
        * Response - should be a msg stating user info was updated and db should reflect new data
          ```json
          {
            "msg": "User info updated successfully!"
          }
          ```

17. Work on functionality for a User to remove his/her account

    * Add `auth` as a 2nd arguement to the `delete` route as well as a `usersController.removeUser` method as a 3rd argument (Note: to be made later)
      ```js
      router.delete('/:id', auth, usersController.removeUser);
      ```
    * Inside the `controllers` folder, inside the `user.js` file, add a new exported asynchronous method title `removeUser`
      ```js
      removeUser: async (req, res) => {}
      ```
    * Using mongoose method `findByIdAndRemove`, locate the user and remove it from the db. Respond with a json msg stating the user was removed
      ```js
      await User.findByIdAndRemove(req.params.id);

      res.json({ msg: 'User account has been removed' });
      ```
    * Test the `delete` route with Postman
        * Headers - x-auth-token: >validtoken<
        * Body - none
        * Response - should return a json msg stating the user was removed and the document for that user should no longer remain in the db
          ```json
          {
            "msg": "User account has been removed"
          }
          ```