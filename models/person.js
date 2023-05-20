const mongoose = require('mongoose');
const url = process.env.MONGODB_URI;

mongoose.set('strictQuery', false);

console.log('connecting to MongoDB');
mongoose
  .connect(url)
  .then(res => {
    console.log('connected to MongoDB');
  })
  .catch(error => {
    console.log('error connecting to MongoDB');
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    validate: {
      validator: v => /^\d{2,3}-\d+$/.test(v)
    }
  }
});

personSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
  }
});

module.exports = mongoose.model('Person', personSchema);
