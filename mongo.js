const mongoose = require('mongoose');

const password = process.argv[2];
const name = process.argv[3];
const number = process.argv[4];

const url = `mongodb+srv://mrjohndorian9:${password}@cluster0.onuhrwo.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false);
mongoose.connect(url);

const personSchema = new mongoose.Schema({
  name: String,
  number: String
});

const Person = mongoose.model('Person', personSchema);

const person = new Person({
  name,
  number
});

if (process.argv.length < 5) {
  Person.find({}).then(persons => {
    persons.forEach(person => {
      console.log(person.name, person.number);
    });
    mongoose.connection.close();
  });

  return;
}

person.save().then(result => {
  console.log('person saved!');
  mongoose.connection.close();
});
