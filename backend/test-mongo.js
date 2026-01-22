require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Conexión exitosa');
    process.exit(0);
  })
  .catch(err => {
    console.error('Error de conexión:', err);
    process.exit(1);
  });
