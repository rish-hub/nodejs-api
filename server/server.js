const express = require('express');
const mongoose = require('mongoose');

const user = require('./routes/api/user');
const auth = require('./routes/api/auth');


const app = express();

//Bodyparser Middleware
app.use(express.json());


app.use('/api/user', user);
app.use('/api/auth', auth);
const port = process.env.PORT || 5000;

app.listen(port, ()=>console.log(`server started on ${port}`));