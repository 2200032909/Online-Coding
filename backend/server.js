require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin'); 

const runRoute = require('./routes/run');
const submissionRoute = require('./routes/submission');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/users', adminRoutes); 

app.use('/api/problems', require('./routes/problem'));

connectDB();
app.use('/api/auth', authRoutes);
app.use('/api/run', runRoute);
app.use('/api/submit', submissionRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
