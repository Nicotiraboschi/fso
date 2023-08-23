const express = require('express');
const morgan = require('morgan');
const app = express();
const cors = require('cors');

const Person = require('./models/person');
// const mongoose = require('mongoose')

app.use(express.static('build'));

app.use(cors());

app.use(express.json());
// app.use(requestLogger);

let content;

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } else if (error.name === 'MongoError' && error.code === 11000) {
    return response.status(400).json({ error: 'Duplicate key error' });
  }
  next(error);
};

app.get('/', (request, response) => {
  response.send('<h1>Hi!</h1>');
});

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons);
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person);
    } else {
      response.status(404).end();
    }
  })
    .catch(error => next(error));
});

app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  console.log(id);

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
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      response.json(updatedPerson);
    })
    .catch(error => {next(error);});
});

app.post('/api/persons', (request, response, next) => {
  const body = request.body;


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
        response.json(savedPerson);
      }).catch(error => next(error));
    });
});

app.get('/info', (request, response) => {
  Person.countDocuments({})
    .then(count => {
      response.send(`<p>Phonebook has info for ${count} people</p><p>${new Date()}</p>`);
    })
    .catch(() => {
      response.status(500).send('Error fetching person count');
    });
});


morgan.token('content', function () {
  return JSON.stringify(content);
});

app.use(morgan(':method :url :status :response-time ms :content'));

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});