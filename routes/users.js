const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const { check, validationResult } = require("express-validator");

const bcryptjs = require("bcryptjs"); // Include Bcryptjs

const auth = require("basic-auth"); // Include Basic Auth

const { User, Course, Plant } = require("../database/models");

// Async Handler Function
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).json({
        message: error.message
      });
    }
  };
}

// Authenticator Middleware
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);
  // Hide log of auth test input
  //   console.log(auth(req));
  if (credentials) {
    const users = await User.findAll();
    const user = users.find(u => u.emailAddress === credentials.name);

    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );

      if (authenticated) {
        // Hide log to show successful login on server
        // console.log(
        //   `Authentication successful for emailAddress: ${credentials.name}`
        // );

        req.currentUser = user;
      } else {
        message = `Authentication failure for Email Address: ${credentials.name}`;
      }
    } else {
      message = `User not found for Email Address: ${credentials.name}`;
    }
  } else {
    message = "Auth header not found";
  }
  if (message) {
    console.warn(message);

    res.status(401).json({
      message:
        "Access Denied - You must be a Registered User to access this API"
    });
  } else {
    next();
  }
};

// GET /api/users 200 - Returns the currently authenticated user
router.get("/", authenticateUser, (req, res) => {
  const user = req.currentUser;

  res.json({
    firstName: user.firstName,
    lastName: user.lastName,
    emailAddress: user.emailAddress,
    userId: user.id
  });
});

// POST /api/users 201 - Creates a user, sets the Location header to "/", and returns no content
router.post(
  "/",
  [
    check("firstName", "Please Provide your First Name")
      .not()
      .isEmpty(),
    check("lastName", "Please Provide your Last Name")
      .not()
      .isEmpty(),
    check("emailAddress")
      .isEmail()
      .withMessage("Please provide a valid Email Address")
      .not()
      .isEmpty()
      .withMessage("Please provide an Email Address"),
    check("password")
      .isLength({ min: 8, max: 20 })
      .withMessage("Please provide a Password between (8 - 20) characters")
      .not()
      .isEmpty()
      .withMessage("Please provide a Password"),
    check("confirmPassword")
      .not()
      .isEmpty()
      .withMessage("Please Provide a Confirmation Password")
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      res.status(400).json({
        location: "body",
        message: "Invalid User Entry",
        errors: errorMessages
      });
    } else {
      //Search users for existing users emailAddress to make sure it doesn't exist
      const userExists = await User.findAll({
        where: {
          emailAddress: {
            [Op.like]: req.body.emailAddress
          }
        }
      });
      if (userExists.length < 1) {
        if (req.body.password === req.body.confirmPassword) {
          // Get the user from the request body.
          const user = User.build({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            emailAddress: req.body.emailAddress,
            password: req.body.password
          });
          // Use Bcryptjs to encrypt the password
          user.password = bcryptjs.hashSync(user.password);
          // Saves the user record and saves it to DB
          user.save().catch(error => {
            // Logs errors caught
            console.log(error);
          });
          res.setHeader("Location", "/");
          res.status(201).json();
        } else {
          res.status(409).json({
            location: "body",
            message: "Passwords do not match",
            errors: ["Passwords do not match"]
          });
        }
      } else if (userExists) {
        res.status(409).json({
          location: "body",
          message: "User already exists",
          errors: ["User already Exists"]
        });
      }
    }
  })
);

// DELETE /api/courses/:id 204 - Deletes a course and returns no content
router.delete(
  "/:userId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let { userId } = req.params;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ["createdAt", "updatedAt"] }
    });
    if (user) {
      if (user.id === req.currentUser.id) {
        user.destroy().then(() => {
          res.status(204).json();
        });
      } else {
        res.status(403).json({
          message: "You can only delete or update your own User Account.",
          currentUser: req.currentUser.id,
          userId: req.body.userId
        });
      }
    } else {
      res
        .status(404)
        .json({ message: "The record your looking for does not exist" });
    }
  })
);

module.exports = router;
