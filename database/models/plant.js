"use strict";

const Sequelize = require("sequelize");

module.exports = sequelize => {
  class Plant extends Sequelize.Model {}
  Plant.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please provide a "User"'
          },
          notNull: {
            args: true,
            msg: '"User" is Required!'
          }
        }
      },
      plantName: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please Provide a "Plant Name"'
          },
          notNull: {
            args: true,
            msg: '"Plant Name" is Required!'
          }
        }
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      estimatedTimeToHarvest: {
        type: Sequelize.STRING,
        allowNull: true
      },
      plantingTime: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      seedDepth: {
        type: Sequelize.STRING,
        allowNull: true
      },
      seedSpacing: {
        type: Sequelize.STRING,
        allowNull: true
      },
      sunLevel: {
        type: Sequelize.STRING,
        allowNull: true
      },
      moistureLevel: {
        type: Sequelize.STRING,
        allowNull: true
      },
      imageOfPlant: {
        type: Sequelize.STRING,
        allowNull: true
      },
      plantingPartners: {
        type: Sequelize.STRING
      },
      plantingEnemies: {
        type: Sequelize.STRING
      },
      seedBook: {
        type: Sequelize.BOOLEAN,
        allowNull: true
      }
    },
    { sequelize }
  );

  Plant.associate = function(models) {
    Plant.belongsTo(models.User, {
      // Associations can be defined here
      as: "owner",
      foreignKey: {
        fieldName: "userId",
        allowNull: false
      }
    });
  };

  return Plant;
};
