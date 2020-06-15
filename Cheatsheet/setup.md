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