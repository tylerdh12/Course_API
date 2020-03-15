"use strict";

module.exports = {
  up: (queryInterface, Sequelize) =>
    queryInterface.bulkInsert(
      /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkInsert('People', [{
        name: 'John Doe',
        isBetaMember: false
      }], {});
    */
      "Users",
      [
        // {
        // firstName: "Tyler",
        // lastName: "Harper",
        // emailAddress: "tylerdh12@gmail.com",
        // password: "Password1234",
        // createdAt: new Date(),
        // updatedAt: new Date()
        // }
      ],
      {}
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Users", null, {
      /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    })
};
