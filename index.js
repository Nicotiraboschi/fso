const express = require('express');
const morgan = require('morgan');
const app = express();

app.use(express.static('dist'))

const cors = require('cors');

app.use(cors());

app.use(express.json());

let content;

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]

app.get('/', (request, response) => {
  response.send('<h1>Hi!</h1>')
})

app.get('/api/persons', (request, response) => {
  content = persons;
  response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)
  if (person) {
    content = person;
    response.json(person)
  } else {
    response.status(404).end()
  }
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)
  response.status(204).end()
})

const generateId = function generatePhonebookEntryId() {
  const minId = 5; // Minimum ID value
  const maxId = 999999; // Maximum ID value
  return Math.floor(Math.random() * (maxId - minId + 1)) + minId;
}

app.post('/api/persons', (request, response) => {
  const body = request.body
  console.log(body)

  if (!body) {
    return response.status(400).json({
      error: 'content missing'
    })
  }
  if (!body.name) {
    return response.status(400).json({
      error: 'name missing'
    })
  }
  if (!body.number) {
    return response.status(400).json({
      error: 'number missing'
    })
  }
  if (persons.find(person => person.name === body.name)) {
    return response.status(400).json({  // 400 Bad Request
      error: 'name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  persons = persons.concat(person)

  content = person;
  response.json(person)
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

morgan.token('content', function (req, res) {
  return JSON.stringify(content);
});

app.use(morgan(':method :url :status :response-time ms :content'));

const PORT = process.env.PORT | 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})