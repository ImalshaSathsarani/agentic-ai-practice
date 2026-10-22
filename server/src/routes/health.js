import express from 'express';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: Math.round(process.uptime() * 100) / 100,
    timestamp: new Date().toISOString()
  });
});

export default router;
