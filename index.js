const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');

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

morgan.token('body', function (req, res) {
  return JSON.stringify(req.body);
});
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
);
app.use(requestLogger);

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} people</p>
	${new Date()}
	`);
});

app.get('/api/persons', (req, res) => {
  res.json(persons);
});

app.get('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  const person = persons.find(p => p.id === id);
  if (person) {
    res.json(person);
  } else {
    res.status(404).send('Person not found!');
  }
});

app.post('/api/persons', (req, res) => {
  const body = req.body;
  const { name, number } = body;
  if (!name || !number) {
    return res.status(400).send('name or number missing');
  }

  if (persons.some(p => p.name === name)) {
    return res.status(400).send('name already exists in the phonebook');
  }
  const newPerson = {
    id: generateId(),
    name: body.name,
    number: body.number
  };
  persons = persons.concat(newPerson);
  res.json(newPerson);
});

app.delete('/api/persons/:id', (req, res) => {
  const id = Number(req.params.id);
  persons = persons.filter(p => p.id !== id);
  res.status(204).end();
});

const PORT = 3001;
app.listen(PORT, () => {
  `server running on port ${PORT}`;
});

app.use(unknownEndpoint);
