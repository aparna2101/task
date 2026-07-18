const express = require('express');
const router = express.Router();
const schedulerController = require('../controllers/schedulerController');
const { verifySchedulerKey } = require('../middleware/auth');

// Route configurations for /api/scheduler
// POST /api/scheduler/run is protected by scheduler secret key verification
router.post('/run', verifySchedulerKey, schedulerController.runScheduler);

// GET /api/scheduler/logs is open for dashboard log viewing
router.get('/logs', schedulerController.getSchedulerLogs);

module.exports = router;
