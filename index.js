const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

const Person = require('./models/person')
const mongoose = require('mongoose')

app.use(express.static('dist'))

app.use(cors());

app.use(express.json());

let content;

app.get('/', (request, response) => {
  response.send('<h1>Hi!</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response) => {
  Person.findById(request.params.id).then(person => {
    response.json(person)
  })
})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  Person = Person.filter(person => person.id !== id)
  response.status(204).end()
})

const generateId = function generatePhonebookEntryId() {
  const minId = 5; // Minimum ID value
  const maxId = 999999; // Maximum ID value
  return Math.floor(Math.random() * (maxId - minId + 1)) + minId;
}

app.post('/api/persons', (request, response) => {
  const body = request.body

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
  if (Person.find(person => person.name === body.name)) {
    return response.status(400).json({  // 400 Bad Request
      error: 'name must be unique'
    })
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number
  }

  person.save().then(savedPerson => {
    response.json(savedPerson)
  })
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

morgan.token('content', function (req, res) {
  return JSON.stringify(content);
});

app.use(morgan(':method :url :status :response-time ms :content'));

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})