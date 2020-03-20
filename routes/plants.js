const express = require("express");
const router = express.Router();
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const { User, Plant, Course } = require("../database/models");

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
        message: error.message
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
      attributes: { exclude: ["createdAt", "updatedAt"] }
    });
    const user = users.find(u => u.emailAddress === credentials.name);

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

// GET /api/plants 200 - Returns a list of plants (including the user that owns each plant)
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const plants = await Plant.findAll({
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          as: "owner",
          attributes: { exclude: ["password", "createdAt", "updatedAt"] }
        }
      ]
    });
    plants
      ? res.status(200).json(plants)
      : res.status(404).json({ message: "Unable to find your plants" });
  })
);

// GET /api/plants/:id 200 - Returns a the plant (including the user that owns the plant) for the provided plant ID
router.get(
  "/:plantId",
  asyncHandler(async (req, res) => {
    let { plantId } = req.params;
    const plant = await Plant.findByPk(plantId, {
      attributes: { exclude: ["createdAt", "updatedAt"] },
      include: [
        {
          model: User,
          as: "owner",
          attributes: { exclude: ["password", "createdAt", "updatedAt"] }
        }
      ]
    });
    plant
      ? res.status(200).json(plant)
      : res.status(404).json({
          message:
            "The plant was not found. Either the plant doesn't exist or there has been an error in your request."
        });
  })
);

// POST /api/plants 201 - Creates a plant, sets the Location header to the URI for the plant, and returns no content
router.post(
  "/",
  [
    check("plantName", 'Please Provide a value for "Plant Name"')
      .not()
      .isEmpty()
  ],
  authenticateUser,
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      res.status(400).json({ errors: errorMessages });
    } else if (req.body.userId === req.currentUser.id) {
      // Get the plant from the request body.
      const plant = await Plant.create({
        userId: req.body.userId,
        plantName: req.body.plantName,
        description: req.body.description,
        estimatedTimeToHarvest: req.body.estimatedTimeToHarvest,
        plantingTime: req.body.plantingTime,
        seedDepth: req.body.seedDepth,
        seedSpacing: req.body.seedSpacing,
        sunLevel: req.body.sunLevel,
        moistureLevel: req.body.moistureLevel,
        imageOfPlant: req.body.imageOfPlant,
        plantingPartners: req.body.plantingPartners,
        plantingEnemies: req.body.plantingEnemies,
        seedBook: req.body.seedBook
      });
      const uri = "/api/plant/" + plant.id;
      res.setHeader("Location", uri);
      res.status(201).json();
    } else {
      res.status(401).json({
        message: "You can only create or update plants that belong to you.",
        currentUser: req.currentUser.id,
        userId: req.body.userId
      });
    }
  })
);

// PUT /api/plants/:id 204 - Updates a plant and returns no content
router.put(
  "/:plantId",
  [
    check("plantName", 'Please Provide a value for "Plant Name"')
      .not()
      .isEmpty()
  ],
  authenticateUser,
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    // If there are validation errors...
    if (!errors.isEmpty()) {
      // Use the Array `map()` method to get a list of error messages.
      const errorMessages = errors.array().map(error => error.msg);

      // Return the validation errors to the client.
      res.status(400).json({ errors: errorMessages });
    } else if (req.body.userId === req.currentUser.id) {
      let { plantId } = req.params;
      const plant = await Plant.findByPk(plantId, {
        attributes: { exclude: ["createdAt", "updatedAt"] }
      });
      plant
        ? plant
            .update({
              userId: req.body.userId,
              plantName: req.body.plantName,
              description: req.body.description,
              estimatedTimeToHarvest: req.body.estimatedTimeToHarvest,
              plantingTime: req.body.plantingTime,
              seedDepth: req.body.seedDepth,
              seedSpacing: req.body.seedSpacing,
              sunLevel: req.body.sunLevel,
              moistureLevel: req.body.moistureLevel,
              imageOfPlant: req.body.imageOfPlant,
              plantingPartners: req.body.plantingPartners,
              plantingEnemies: req.body.plantingEnemies,
              seedBook: req.body.seedBook
            })
            .then(() => {
              res.status(204).json();
            })
        : res.status(404).json({
            message:
              "The plant was not found. Either the plant doesn't exist or there has been an error in your request."
          });
    } else {
      res.status(403).json({
        message: "You can only create or update plants that belong to you.",
        currentUser: req.currentUser.id,
        userId: req.body.userId
      });
    }
  })
);

// DELETE /api/plants/:id 204 - Deletes a plant and returns no content
router.delete(
  "/:plantId",
  authenticateUser,
  asyncHandler(async (req, res) => {
    let { plantId } = req.params;
    const plant = await Plant.findByPk(plantId, {
      attributes: { exclude: ["createdAt", "updatedAt"] }
    });
    if (plant) {
      if (plant.userId === req.currentUser.id) {
        plant.destroy().then(() => {
          res.status(204).json();
        });
      } else {
        res.status(403).json({
          message: "You can only create or update plants that belong to you.",
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
