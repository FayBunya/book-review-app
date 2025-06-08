const express = require('express');
const session = require('express-session');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const app = express();

app.use(express.json());
app.use(session({
  secret: 'secretKey',
  resave: false,
  saveUninitialized: true
}));

let books = {
  "111": {
    isbn: "111",
    title: "Harry Potter",
    author: "J.K. Rowling",
    reviews: []
  },
  "222": {
    isbn: "222",
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    reviews: []
  }
};

let users = [];

function authenticate(req, res, next) {
  const token = req.session.token;
  if (!token) return res.status(403).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, 'jwtKey');
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ message: 'Invalid token' });
  }
}

// General Users
app.get('/books', (req, res) => res.json(books));

app.get('/books/isbn/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.json(book);
  res.status(404).json({ message: 'Book not found' });
});

app.get('/books/author/:author', (req, res) => {
  const result = Object.values(books).filter(b => b.author === req.params.author);
  res.json(result);
});

app.get('/books/title/:title', (req, res) => {
  const result = Object.values(books).filter(b => b.title === req.params.title);
  res.json(result);
});

app.get('/books/review/:isbn', (req, res) => {
  const book = books[req.params.isbn];
  if (book) return res.json(book.reviews);
  res.status(404).json({ message: 'Book not found' });
});

// Register
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const exists = users.find(u => u.username === username);
  if (exists) return res.status(400).json({ message: 'User already exists' });

  const hashed = await bcrypt.hash(password, 10);
  users.push({ username, password: hashed });
  res.status(201).json({ message: 'User registered' });
});

// Login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  if (!user) return res.status(401).json({ message: 'Invalid user' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid password' });

  const token = jwt.sign({ username }, 'jwtKey');
  req.session.token = token;
  res.json({ message: 'Logged in', token });
});

// Add or Modify Review
app.post('/auth/review/:isbn', authenticate, (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  const book = books[isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });

  book.reviews = book.reviews.filter(r => r.username !== req.user.username);
  book.reviews.push({ username: req.user.username, review });
  res.json({ message: 'Review added/updated' });
});

// Delete Review
app.delete('/auth/review/:isbn', authenticate, (req, res) => {
  const book = books[req.params.isbn];
  if (!book) return res.status(404).json({ message: 'Book not found' });

  const oldLen = book.reviews.length;
  book.reviews = book.reviews.filter(r => r.username !== req.user.username);
  if (book.reviews.length === oldLen)
    return res.status(404).json({ message: 'Review not found' });

  res.json({ message: 'Review deleted' });
});

app.listen(3000, () => console.log('Server running on port 3000'));