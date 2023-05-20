require('dotenv').config();
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');

let persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456'
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523'
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345'
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122'
  }
];

const generateId = () => {
  return persons.length > 0 ? Math.max(...persons.map(p => p.id)) + 1 : 1;
};

const requestLogger = (req, res, next) => {
  console.log('Method:', req.method);
  console.log('Path:  ', req.path);
  console.log('Body:  ', req.body);
  console.log('---');
  next();
};

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' });
};

app.use(cors());
app.use(express.json());
app.use(express.static('dist'));

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);
app.use(requestLogger);

app.get('/info', (req, res) => {
  Person.find({}).then(people => {
    res.send(`<p>Phonebook has info for ${people.length} people</p>
    ${new Date()}
    `);
  });
});

app.get('/api/persons', (req, res, next) => {
  Person.find({})
    .then(people => {
      res.json(people);
    })
    .catch(error => next(error));
});

app.get('/api/persons/:id', (req, res, next) => {
  const id = req.params.id;
  Person.findById(id)
    .then(returnedPerson => {
      if (returnedPerson) {
        res.json(returnedPerson);
      } else {
        res.status(404).send({ error: 'person not found' });
      }
    })
    .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
  const body = req.body;
  const { name, number } = body;
  if (!name || !number) {
    return res.status(400).send('name or number missing');
  }

  if (persons.some(p => p.name === name)) {
    return res.status(400).send('name already exists in the phonebook');
  }
  const newPerson = new Person({
    name,
    number
  });
  newPerson
    .save()
    .then(returnedPerson => {
      res.json(returnedPerson);
    })
    .catch(error => next(error));
});

app.put('/api/persons/:id', (req, res, next) => {
  const newPerson = {
    name: req.body.name,
    number: req.body.number
  };
  Person.findByIdAndUpdate(req.params.id, newPerson, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then(updatedPerson => res.json(updatedPerson))
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id).then(stuff => {
    persons = persons.filter(p => p.id !== req.params.id);
    res.status(204).end();
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  `server running on port ${PORT}`;
});

app.use(unknownEndpoint);

const errorMiddleware = (error, req, res, next) => {
  console.log(error);
  if (error.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    if (error.errors.number.path === 'number') {
      return res.status(400).send({
        error:
          'Minimum required length for phone number is 8 characters, required format is XX(X)-XXXXXX'
      });
    }
    return res
      .status(400)
      .send({ error: 'minimum allowed length for name is 3' });
  }

  next(error);
};

app.use(errorMiddleware);
