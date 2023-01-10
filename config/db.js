const mongoose = require("mongoose");
// const { GenerateData } = require("../generate");

const connectDb = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    // await conn.connection.db.dropDatabase();
    // await GenerateData();

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.log(err);
  }
};

module.exports = connectDb;
