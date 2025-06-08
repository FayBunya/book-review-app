const axios = require('axios');

// Task 10: Get all books (Async/Await)
async function getAllBooks() {
  try {
    const res = await axios.get('http://localhost:3000/books');
    console.log('All Books:', res.data);
  } catch (err) {
    console.error('Error getting books:', err.message);
  }
}

// Task 11: Search by ISBN (Promises)
function getByISBN(isbn) {
  axios.get(`http://localhost:3000/books/isbn/${isbn}`)
    .then(res => console.log('Book by ISBN:', res.data))
    .catch(err => console.error('Error:', err.message));
}

// Task 12: Search by Author (Async/Await)
async function getByAuthor(author) {
  try {
    const res = await axios.get(`http://localhost:3000/books/author/${author}`);
    console.log('Books by Author:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Task 13: Search by Title (Async/Await)
async function getByTitle(title) {
  try {
    const res = await axios.get(`http://localhost:3000/books/title/${title}`);
    console.log('Books by Title:', res.data);
  } catch (err) {
    console.error('Error:', err.message);
  }
}

// Call your functions for testing here
getAllBooks();
getByISBN("111");
getByAuthor("J.K. Rowling");
getByTitle("Harry Potter");