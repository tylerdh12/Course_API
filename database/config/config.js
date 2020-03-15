require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres"
  },
  test: {
    url: process.env.TEST_DATABASE_URL,
    dialect: "postgres"
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: "postgres"
  }
};
