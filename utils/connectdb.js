// External Dependencies
const mongoose = require('mongoose');

const { DATABASE } = require('../config/keys');

const connectDB = mongoose.connect(DATABASE.URI, {
  useNewUrlParser: true
});

connectDB
  .then(db => {
    console.log('Database connected');
  })
  .catch(err => {
    console.log(err);
    process.exit(1);
  });
