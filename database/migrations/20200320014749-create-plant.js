"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Plants", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      plantName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT
      },
      estimatedTimeToHarvest: {
        type: Sequelize.STRING
      },
      plantingTime: {
        type: Sequelize.TEXT
      },
      seedDepth: {
        type: Sequelize.STRING
      },
      seedSpacing: {
        type: Sequelize.STRING
      },
      sunLevel: {
        type: Sequelize.STRING
      },
      moistureLevel: {
        type: Sequelize.STRING
      },
      imageOfPlant: {
        type: Sequelize.STRING
      },
      plantingPartners: {
        type: Sequelize.STRING
      },
      plantingEnemies: {
        type: Sequelize.STRING
      },
      seedBook: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Plants");
  }
};
