const openRoutes = require('express').Router();
const registerRoute = require('./controllers/auth');
openRoutes.use('/auth', registerRoute);


const protectedRoutes = require('express').Router();
const authMiddleware = require('./middlewares/auth');
const userRoutes = require('./controllers/users');
protectedRoutes.use(authMiddleware);
protectedRoutes.use('/api', userRoutes);

module.exports = { openRoutes, protectedRoutes };