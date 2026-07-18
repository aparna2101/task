const verifySchedulerKey = (req, res, next) => {
  const apiKey = req.headers['x-scheduler-key'];
  const secretKey = process.env.SCHEDULER_KEY;

  if (!secretKey) {
    return res.status(500).json({
      success: false,
      message: 'Scheduler key is not configured on the server.'
    });
  }

  if (!apiKey || apiKey !== secretKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized. Invalid or missing x-scheduler-key header.'
    });
  }

  next();
};

module.exports = { verifySchedulerKey };
