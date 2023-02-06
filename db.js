// DATABASE CONNECTION
const mongoose = require('mongoose');

const url = "mongodb://localhost:27017/grpcDB";

mongoose.connect(url)


require("./src/model/MessageField");


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error connecting to mongodb'))
db.once('open', function callback() {
    console.log('\t[>>>] Connected to mongoDB')
})

module.exports = db