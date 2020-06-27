"use strict";

const Sequelize = require("sequelize");

module.exports = (sequelize) => {
  class Task extends Sequelize.Model {}
  Task.init(
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        unique: true,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please provide a "User"',
          },
          notNull: {
            args: true,
            msg: '"User" is Required!',
          },
        },
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        validate: {
          notEmpty: {
            args: true,
            msg: 'Please Provide a "Task / Item"',
          },
          notNull: {
            args: true,
            msg: '"Task / Item" is Required!',
          },
        },
      },
      isComplete: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
      },
    },
    { sequelize }
  );

  Task.associate = function (models) {
    Task.belongsTo(models.User, {
      // Associations can be defined here
      as: "owner",
      foreignKey: {
        fieldName: "userId",
        allowNull: false,
      },
    });
  };

  return Task;
};
