const mongoose = require('mongoose')



/* Representa un usuario de la aplicación */
const UserSchema = new mongoose.Schema({
    username: String,
    name: String,
    surname: String,
    email: String,
    password: String,
    last_conn_time: Date,
    role: {type : String, enum: ['researcher', 'admin']}
}, {versionKey: false});

const User = mongoose.model('users', UserSchema);


module.exports = User;