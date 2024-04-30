require('dotenv').config()
const express = require('express')
const cors = require('cors')
// middleware morgan
const morgan = require('morgan');
const app = express()

const Person = require('./models/person');

// take the middleware to use and allow for requests from all origins:
app.use(cors())

// built-in middleware from Express [static] (make Express show static content, index.html and the JavaScript, etc)
app.use(express.static('dist'))

// activate the json-parser 
app.use(express.json())

// middleware (log messages to your console based on the tiny configuration)
// app.use(morgan('tiny')); //it will print HTTP req num, content-length and time taken in ms

// Define a custom token for Morgan to log request body data
morgan.token('req-body', (req, res) => {
  return JSON.stringify(req.body);
});

// Add Morgan middleware with custom token
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));


// not recommended the maxID method but replace soon
// Function to generate a random ID
const generateId = () => {
  const min = 1;
  const max = 1000000000; // Use a larger range for random values
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


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
]

//   root 
  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })


//   all collection get
  // app.get('/api/persons', (request, response) => {
  //   response.json(persons)
  // })

  // mongo
  app.get('/api/persons', (request, response) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
  })

//   for individual id get
  // app.get('/api/persons/:id', (request, response) => {
  //   const id = Number(request.params.id)
  //   const person = persons.find(person => {
  //       // console.log(note.id, typeof note.id, id, typeof id, note.id === id)
  //       return person.id === id
  //     })
  //   // console.log(note)
  //   if (person) {
  //       response.json(person)
  //     } else {
  //       // response.status(404).end()
  //       response.statusMessage = "Page Not Found.";
  //       response.status(404).end();
  //     }
  // })

  // individual id via mongo
  app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id).then(person => {
        if (person) {
          response.json(person)
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
  })



  
//   post request
  app.post('/api/persons', (request, response) => {
    // const person = request.body
    // console.log(person)
    // response.json(person)

   
    const body = request.body
    
    // Check if name or number is missing
    if (!body.name || !body.number) {
      return response.status(400).json({ 
        error: 'name or number is missing' 
      });
    }

    // Check if the name already exists in the phonebook
    if (persons.some(person => person.name === body.name)) {
      return response.status(400).json({ 
        error: 'name must be unique' 
      });
    }

    // Create a new person object with a generated ID
    // const person = {
    //     name: body.name,
    //     number: body.number,
    //     id: generateId(),
    // }

    // Add the new person to the phonebook
    // persons = persons.concat(person)

    // Send a JSON response with the newly created person object
    // response.json(person)

    //with mongo
    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person.save().then(savedPerson => {
      response.json(savedPerson)
    }) 

  })


  // put / update with mongo
  app.put('/api/persons/:id', (request, response, next) => {
    const body = request.body
  
    const person = {
      name: body.name,
      number: body.number,
    }
  
    Person.findByIdAndUpdate(request.params.id, person, { new: true })
      .then(updatedPerson => {
        response.json(updatedPerson)
      })
      .catch(error => next(error))
  })

//   for delete
  // app.delete('/api/persons/:id', (request, response) => {
  //   const id = Number(request.params.id)
  //   persons = persons.filter(person => person.id !== id)
  
  //   response.status(204).end()
  // })

  // with mongo delete
  app.delete('/api/persons/:id', (request, response, next) => {
    Person.findByIdAndDelete(request.params.id)
      .then(result => {
        response.status(204).end()
      })
      .catch(error => next(error))
  })


 // Route to get information about the server
// app.get('/info', (request, response) => {
//   const requestTime = new Date();
//   const numEntries = persons.length;
//   const responseContent = `
//     <p>Request received at: ${requestTime}</p>
//     <p>Number of entries in the persons: ${numEntries}</p>
//   `;
//   response.send(responseContent);
// });

// with mongo
app.get('/info', async (request, response) => {
  try {
    const requestTime = new Date();
    
    // Query MongoDB to get all documents from the collection
    const numEntries = await Person.countDocuments();
    
    const responseContent = `
      <p>Request received at: ${requestTime}</p>
      <p>Number of entries in the persons: ${numEntries}</p>
    `;
    response.send(responseContent);
  } catch (error) {
    // Handle any errors
    console.error('Error fetching number of entries:', error);
    response.status(500).send('Internal Server Error');
  }
});
  



const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})


const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)


//error handling
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)