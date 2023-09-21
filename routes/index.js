// External Dependencies
const router = require('express').Router();

// Internal Dependencies
const apiRoutes = require('./api/index');
const keys = require('../config/keys');
const { API_URL } = keys.APP;

const api = `/${API_URL}`;

// api routes
router.use(api, apiRoutes);
router.use(api, (req, res) => res.status(404).json('No API route found'));

module.exports = router;
