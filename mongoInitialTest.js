const mongoose = require('mongoose');

if (process.argv.length<3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const dbName = 'phoneBook';
const url = `mongodb+srv://<username>:${password}@cluster0.drm2bdh.mongodb.net/${dbName}?retryWrites=true&w=majority`;

mongoose.set('strictQuery',false)

mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(error => {
    console.error('Error connecting to MongoDB:', error);
  });

const personSchema = new mongoose.Schema({
  name: String,
  number:String,
}, { collection: 'persons', dbName: 'phoneBook' })

const Person = mongoose.model('Person', personSchema);

const person = new Person({
    "name": "Ada Lovelace", 
    "number": "39-44-5323523"
})

// person.save().then(result => {
//     console.log('Person saved!', result);
//     mongoose.connection.close();
//   }).catch(error => {
//     console.error('Error saving person:', error);
//     mongoose.connection.close();
//   });


Person.find({}).then(result => {
    result.forEach(person => {
      console.log(person)
    })
    mongoose.connection.close()
  })