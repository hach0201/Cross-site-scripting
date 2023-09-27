
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const csrf = require('csurf'); // Add the CSRF protection library
const sanitizeHtml = require('sanitize-html'); // Add the HTML sanitization library
const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({ secret: 'your-secret-key', resave: true, saveUninitialized: true }));

// Set up CSRF protection
const csrfProtection = csrf({ cookie: true });

// Sanitization options
const sanitizeOptions = {
  allowedTags: ['b', 'i', 'em', 'strong', 'a'], // Allow only specific HTML tags
  allowedAttributes: {
    'a': ['href'] // Allow href attribute for anchor tags
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Sample Vulnerable Node.js Application');
});

app.get('/login', (req, res) => {
  res.send(`
    <h1>Login</h1>
    <form action="/login" method="POST">
      <input type="text" name="username" placeholder="Username" required><br>
      <input type="password" name="password" placeholder="Password" required><br>
      <button type="submit">Login</button>
    </form>
  `);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Authenticate user (vulnerable code for the challenge)
  if (username === 'admin' && password === 'password') {
    req.session.authenticated = true;
    req.session.username = sanitizeHtml(username, sanitizeOptions); // Sanitize username
    res.redirect('/profile');
  } else {
    res.send('Invalid username or password');
  }
});

app.get('/profile', csrfProtection, (req, res) => {
  if (req.session.authenticated) {
    res.send(`<h1>Welcome to your profile, ${req.session.username}</h1>`);
  } else {
    res.redirect('/login');
  }
});

// Server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});
