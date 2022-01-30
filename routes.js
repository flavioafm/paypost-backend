const openRoutes = require('express').Router();
const registerRoute = require('./controllers/auth');
openRoutes.use('/auth', registerRoute);


const protectedRoutes = require('express').Router();
const authMiddleware = require('./middlewares/auth');
protectedRoutes.use(authMiddleware);

const userRoutes = require('./controllers/users');
const platformRoutes = require('./controllers/platforms');
protectedRoutes.use('/api', userRoutes);
protectedRoutes.use('/api', platformRoutes);

module.exports = { openRoutes, protectedRoutes };