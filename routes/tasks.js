const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const { User, Task } = require("../database/models");

const { check, validationResult } = require("express-validator");

const bcryptjs = require("bcryptjs"); // Include Bcryptjs
const auth = require("basic-auth"); // Include Basic Auth

// Async Handler Function
function asyncHandler(cb) {
  return async (req, res, next) => {
    try {
      await cb(req, res, next);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  };
}

// Authenticator Middleware
const authenticateUser = async (req, res, next) => {
  let message = null;
  const credentials = auth(req);

  console.log(auth(req));
  if (credentials) {
    const users = await User.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    const user = users.find((u) => u.emailAddress === credentials.name);

    if (user) {
      const authenticated = bcryptjs.compareSync(
        credentials.pass,
        user.password
      );

      if (authenticated) {
        console.log(
          `Authentication successful for username: ${credentials.name}`
        );

        req.currentUser = user;
      } else {
        message = `Authentication failure for username: ${credentials.name}`;
      }
    } else {
      message = `User not found for username: ${credentials.name}`;
    }
  } else {
    message = "Auth header not found";
  }
  if (message) {
    console.warn(message);

    res.status(401).json({ message: "Access Denied" });
  } else {
    next();
  }
};

// GET /api/tasks 200 - Returns a list of tasks (including the user that owns each task)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const tasks = await Task.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          as: "owner",
          attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        },
      ],
    });
    tasks
      ? res.status(200).json(tasks)
      : res.status(404).json({ message: "Unable to find the tasks" });
  })
);

// GET /api/tasks/:id 200 - Returns a the task (including the user that owns the task) for the provided task ID
router.get(
  "/:taskId",
  asyncHandler(async (req, res) => {
    let { taskId } = req.params;
    const task = await Task.findByPk(taskId, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          as: "owner",
          attributes: { exclude: ["password", "createdAt", "updatedAt"] },
        },
      ],
    });
    task
      ? res.status(200).json(task)
      : res.status(404).json({
          message:
            "The task was not found. Either the task doesn't exist or there has been an error in your request.",
        });
  })
);

// POST /api/tasks 201 - Creates a task, sets the Location header to the URI for the task, and returns no content
router.post(
  "/",
  [check("title", 'Please Provide a value for "Title"').not().isEmpty()],
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map((error) => error.msg);

      // Return the validation errors to the client.
      res.status(400).json({ errors: errorMessages });
    } else if (req.body.userId === req.currentUser.id) {
      // Get the task from the request body.
      const task = await Task.create({
        userId: req.currentUser.id,
        title: req.body.title,
        isComplete: req.body.isComplete,
      });
      const uri = "/api/task/" + task.id;
      res.setHeader("Location", uri);
      res.status(201).json();
    } else {
      res.status(401).json({
        message: "You can only create or update tasks that belong to you.",
        currentUser: req.currentUser.id,
        userId: req.body.userId,
      });
    }
  })
);

// PUT /api/tasks/:id 204 - Updates a task and returns no content
router.put(
  "/:taskId",
  [check("title", 'Please Provide a value for "Title"').not().isEmpty()],
  authenticateUser,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map((error) => error.msg);

      // Return the validation errors to the client.
      res.status(400).json({ errors: errorMessages });
    } else if (req.body.userId === req.currentUser.id) {
      let { taskId } = req.params;
      const task = await Task.findByPk(taskId, {
        attributes: { exclude: ["createdAt", "updatedAt"] },
      });
      task
        ? task
            .update({
              userId: req.body.userId,
              title: req.body.title,
              isComplete: req.body.isComplete,
            })
            .then(() => {
              res.status(204).json();
            })
        : res.status(404).json({
            message:
              "The task was not found. Either the task doesn't exist or there has been an error in your request.",
          });
    } else {
      res.status(403).json({
        message: "You can only create or update tasks that belong to you.",
        currentUser: req.currentUser.id,
        userId: req.body.userId,
      });
    }
  })
);

// DELETE /api/tasks/:id 204 - Deletes a task and returns no content
router.delete(
  "/:taskId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let { taskId } = req.params;
    const task = await Task.findByPk(taskId, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
    });
    if (task) {
      if (task.userId === req.currentUser.id) {
        task.destroy().then(() => {
          res.status(204).json();
        });
      } else {
        res.status(403).json({
          message: "You can only create or update tasks that belong to you.",
          currentUser: req.currentUser.id,
          userId: req.body.userId,
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
