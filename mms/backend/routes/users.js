const express = require('express');
const db = require('../config/db');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

router.get('/me', authenticateToken, (req, res) => {
  if (req.user.role === 'student') {
    db.query(
      'SELECT * FROM attendance WHERE user_id = ?',
      [req.user.id],
      (err, attendance) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        db.query(
          'SELECT * FROM fees WHERE user_id = ?',
          [req.user.id],
          (err, fees) => {
            if (err) return res.status(500).json({ message: 'Server error' });
            res.json({
              attendance: attendance.map(a => ({
                date: a.date,
                status: a.status,
              })),
              fees: fees.map(f => ({
                month: f.month,
                status: f.status,
              })),
            });
          }
        );
      }
    );
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
});

router.get('/students', authenticateToken, (req, res) => {
  if (req.user.role === 'admin') {
    db.query(
      'SELECT u.id, u.name, u.email, a.status AS attendanceStatus, f.status AS feeStatus ' +
      'FROM users u LEFT JOIN attendance a ON u.id = a.user_id ' +
      'LEFT JOIN fees f ON u.id = f.user_id WHERE u.role = "student"',
      (err, results) => {
        if (err) return res.status(500).json({ message: 'Server error' });
        res.json(
          results.map(student => ({
            name: student.name,
            email: student.email,
            attendanceStatus: student.attendanceStatus || 'N/A',
            feeStatus: student.feeStatus || 'N/A',
          }))
        );
      }
    );
  } else {
    res.status(403).json({ message: 'Access denied' });
  }
});

module.exports = router;