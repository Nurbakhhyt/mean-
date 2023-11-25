const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const mongoose = require("mongoose")
const path = require("path");
const fs = require('fs');
const axios  = require('axios');
const port = 8080;



mongoose.connect('mongodb://localhost:27017/auth')
app.set('view engine', 'ejs')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + 'public'))
app.get('/', (req , res) => {
  res.sendFile( __dirname + '/templates/weather.html');
});

fs.readFile('file.txt', 'utf8', (err, data) => {
  if(err){
    console.error('Error',err);
    return
  }
  console.log(data)
});

fs.readdir(__dirname, (err, files) => {
  if (err) {
    console.error(err);
    return;
  }

  files.forEach(file => {
    console.log(file);
  });
});



function deleteFileOrDir(path) {
  fs.unlink(path,function(err){
    if(err) throw err;

    console.log('File deleted!');
})};
deleteFileOrDir('file.txt')
let data = [];

app.post('/api/posts', async (req, res) => {
  const postData = req.body;

  try {
    // Отправка POST запроса к JSONPlaceholder API
    const response = await axios.post('https://jsonplaceholder.typicode.com/posts', postData);

    // Здесь можно добавить логику для сохранения данных в локальной базе данных
    const savedData = response.data;

    res.json(savedData);
  } catch (error) {
    console.error('Error creating or updating data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Создание записи
app.post('/api/data', (req, res) => {
  const newItem = req.body;
  data.push(newItem);
  res.json(newItem);
});

// Получение всех записей
app.get('/api/data', (req, res) => {
  res.json(data);
});

// Обновление записи
app.put('/api/data/:id', (req, res) => {
  const itemId = req.params.id;
  const updatedItem = req.body;

  // Логика обновления (можно заменить на запрос к базе данных)
  const index = data.findIndex(item => item.id === itemId);
  if (index !== -1) {
    data[index] = updatedItem;
    res.json(updatedItem);
  } else {
    res.status(404).json({ error: 'Item not found' });
  }
});

// Удаление записи
app.delete('/api/data/:id', (req, res) => {
  const itemId = req.params.id;

  // Логика удаления (можно заменить на запрос к базе данных)
  data = data.filter(item => item.id !== itemId);
  res.json({ success: true });
});

// deleteFileOrDir();







const db = mongoose.connection;
db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.once('open', () => {
  console.log('Connected to MongoDB');
});


const BooksSchema = mongoose.Schema({
    id: String,  
    name: String,
    author: String,
    year: Number,
})

const Book = mongoose.model("books", BooksSchema)

app.get('/books', async (req, res) => {
  try{
    const books = await Book.find();
    res.json(books);
    res.sendfile
  } catch (error) {
    console.error(error);
    res.status(500).json({error: ""});
  }
});

app.get('/books_page', async (req ,res) => {
  res.sendFile(path.join(__dirname, '/public/templates/index.html'));
});

app.delete('/books/:id', async (req, res) => {
  const bookId = req.params.id;
  console.log(bookId)

  try {
      const deletedBook = await Book.findByIdAndDelete(bookId);
      if (deletedBook) {
          console.log(`book with ID ${bookId} deleted successfully`);
          res.status(200).json({ message: 'book deleted successfully' });
      } else {
          console.error(`book with ID ${bookId} not found`);
          res.status(404).json({ error: 'book not found' });
      }
  } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/books/:id', async (req, res) => {
  const bookId = req.params.id;
  const { name, author,year } = req.body;

  try {
      const updatedBook = await Book.findByIdAndUpdate(
          bookId,
          { name, author, year },
          { new: true }
      );

      if (updatedBook) {
          console.log(`book with ID ${bookId} updated successfully`);
          res.status(200).json({ message: 'book updated successfully' });
      } else {
          console.error(`book with ID ${bookId} not found`);
          res.status(404).json({ error: 'book not found' });
      }
  } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/books' , async (req, res) => {
  const {name, author, year} = req.body;

  try{
    const newBook = new Book({name, author, year});
    const savedBook = await newBook.save();
    console.log('book created successfully', savedBook);
    res.status(201).json(savedBook);
  } catch(error){
    console.error('Error creating book:', error);
    res.status(500).json({error: 'Internal server error'});
  }

});


app.get('/name/:name', (req, res) => {
  const name = req.params.name;
  res.send(`Ассалаумағалейкум, ${name}!`);
});

app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).send('Что-то пошло не так!');
});


app.listen(port, () => {
  console.log(`Сервер запущен на порту ${port} \n Hello client!`);
});

