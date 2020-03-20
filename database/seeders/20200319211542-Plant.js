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
      "Plants",
      [
        {
          userId: 2,
          plantName: "Carrot - Danvers 126",
          description:
            "Growers in Danvers, Massachusetts during the late-19th century were searching for a carrot with improved color, yield, and uniformity. After many variations, the Danvers 126 carrot was born! It grows particularly well interplanted with onions and in heavy soil due to its high fiber content. Heat-tolerant with high yields, the Danver 126 also has a noticeably sweet flavor and stores exceptionally well if cleaned after harvest. Resistant to cracks and splits, strong tops make harvesting easy. Deliciously fresh when picked straight from the garden!",
          estimatedTimeToHarvest: "65 Days",
          plantingTime:
            "2 to 4 weeks before average last frost. Successive Planting: every 3 weeks until 60 days before first fall frost. In very warm climates, carrots are grown primarily in fall, winter, and spring.",
          seedDepth: ".25 inch",
          seedSpacing: "1 inch",
          sunLevel: "full",
          moistureLevel: "moderate",
          imageOfPlant: "",
          plantingPartners: [],
          plantingEnemies: [],
          seedBook: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]
    ),

  down: (queryInterface, Sequelize) =>
    queryInterface.bulkDelete("Plants", null, {
      /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
    })
};
