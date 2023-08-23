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
  const id = request.params.id;
  console.log(id)

  // Find and delete the person
  Person.findOneAndDelete({ _id: id })
    .then(deletedPerson => {
      if (!deletedPerson) {
        return response.status(404).json({ error: 'Person not found' });
      }
      response.status(204).end(); // 204 No Content (successful delete)
    })
    .catch(error => {
      console.error('Error deleting person:', error);
      response.status(500).json({ error: 'Error deleting person' });
    });
})

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
  Person.findOne({ name: body.name })
  .then(existingPerson => {
    if (existingPerson) {
      return response.status(400).json({
        error: 'name must be unique'
      });
    }

    const person = new Person({
      name: body.name,
      number: body.number
    });

  person.save().then(savedPerson => {
    response.json(savedPerson)
  }).catch(error => {
    console.error('Error saving person:', error);
    response.status(500).json({ error: 'Error saving person' });
  });
  })
  .catch(error => {
    console.error('Error checking uniqueness:', error);
    response.status(500).json({ error: 'Server error' });
  });
})

app.get('/info', (request, response) => {
  response.send(`<p>Phonebook has info for ${Person.length} people</p><p>${new Date()}</p>`)
})

morgan.token('content', function (req, res) {
  return JSON.stringify(content);
});

app.use(morgan(':method :url :status :response-time ms :content'));

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})