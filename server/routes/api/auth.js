const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth')
const mongoose = require('mongoose');
// Db string 
const db = config.get('mongoUri');
// User Model
const User = require('../../models/User');

// @route Get api/AUTH
// @Dec   Auth User
// @access Public  
router.post('/', (req, res) => {

    const {
        password,
        username } = req.body;
    // minimal check for fields
    if (!password || !username) {
        return res.status(400).json({ msg: "All Feilds Are Required" })
    }
    const connStr = `${db}` + '/master';  
    mongoose.connect(connStr, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
    }).then(() => {
        User.findOne({ username })
            .then(user => {
                if (!user) return res.status(400).json({ msg: 'User Does Not Exists' })

                // Salt and hash compare pass
                bcrypt.compare(password, user.password)
                    .then(isMatch => {
                        if (!isMatch) return res.status(400).json({ msg: 'Invalid Password' })

                        jwt.sign(
                            { id: user.id, role: user.role, username },
                            config.get('jwtSecret'),
                            { expiresIn: 3600 },
                            (err, token) => {
                                if (err) throw err;
                                mongoose.connection.close();
                                res.json({
                                    token,
                                    id: user.id,
                                    role: user.role,
                                    firstName: user.firstName,
                                    email: user.email
                                })
                            }
                        )
                    })
            })
            .catch(err => res.status(400))

    }).catch(err => console.log(err))
    //checking  existing email

});


module.exports = router;
