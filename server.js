const express = require('express');

// Імпортуємо всі дані один раз!
const { users, documents, employees } = require('./data');

const app = express();
const PORT = 3000;

// Дозволяє працювати з JSON у POST запитах
app.use(express.json());

// --- MIDDLEWARE ---
// Аутентифікація
const authMiddleware = (req, res, next) => {
  const login = req.headers['x-login'];
  const password = req.headers['x-password'];

  const user = users.find(u => u.login === login && u.password === password);

  if (!user) {
    return res.status(401).json({
      message: 'Authentication failed. Please provide valid credentials in headers X-Login and X-Password.'
    });
  }

  req.user = user;
  next();
};

// Авторизація (тільки admin)
const adminOnlyMiddleware = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
  next();
};

// --- МАРШРУТИ ---
// Documents: доступ для всіх авторизованих користувачів
app.get('/documents', authMiddleware, (req, res) => {
  res.status(200).json(documents);
});

app.post('/documents', authMiddleware, (req, res) => {
  const newDocument = req.body;
  newDocument.id = Date.now();
  documents.push(newDocument);
  res.status(201).json(newDocument);
});

// Employees: доступ тільки для admin
app.get('/employees', authMiddleware, adminOnlyMiddleware, (req, res) => {
  res.status(200).json(employees);
});

// --- Запуск сервера ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});