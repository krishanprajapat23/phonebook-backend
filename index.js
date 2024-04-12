const express = require('express')
const cors = require('cors')
// middleware morgan
const morgan = require('morgan');
const app = express()

// take the middleware to use and allow for requests from all origins:
app.use(cors())

// middleware (log messages to your console based on the tiny configuration)
// app.use(morgan('tiny')); //it will print HTTP req num, content-length and time taken in ms

// Define a custom token for Morgan to log request body data
morgan.token('req-body', (req, res) => {
  return JSON.stringify(req.body);
});

// Add Morgan middleware with custom token
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :req-body'));



// activate the json-parser 
app.use(express.json())


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

//   root 
  app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
  })


//   all collection get
  app.get('/api/persons', (request, response) => {
    response.json(persons)
  })

//   for individual id get
  app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => {
        // console.log(note.id, typeof note.id, id, typeof id, note.id === id)
        return person.id === id
      })
    // console.log(note)
    if (person) {
        response.json(person)
      } else {
        // response.status(404).end()
        response.statusMessage = "Page Not Found.";
        response.status(404).end();
      }
  })

//   post request
  app.post('/api/persons', (request, response) => {
    // const person = request.body
    // console.log(person)
    // response.json(person)

   
    const body = request.body
    console.log(body);

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
    const person = {
        name: body.name,
        number: body.number,
        id: generateId(),
    }

    // Add the new person to the phonebook
    persons = persons.concat(person)

    // Send a JSON response with the newly created person object
    response.json(person)

  })

//   for delete
  app.delete('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
  
    response.status(204).end()
  })


 // Route to get information about the server
app.get('/info', (request, response) => {
  const requestTime = new Date();
  const numEntries = persons.length;
  const responseContent = `
    <p>Request received at: ${requestTime}</p>
    <p>Number of entries in the persons: ${numEntries}</p>
  `;
  response.send(responseContent);
});
  
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })