const mongoose = require('mongoose');
const { Schema } = mongoose;
const DB = process.env.MONGO_URI;

mongoose
  .connect(DB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to Mongo!');
  })
  .catch((err) => {
    console.error('Error connecting to Mongo', err);
  });

const urlSchema = new Schema({
  original_url: { type: String, required: true },
  url_id: { type: Number, required: true },
});

urlSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  },
});

module.exports = mongoose.model('Url', urlSchema);
