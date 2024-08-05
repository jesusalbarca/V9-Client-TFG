/**
 * @fileoverview This file is the database connection file.
 **/

/*
 * @param ip : where the database is hosted
 * @param port : the port of the database
 * @param dbName: the name of the database to access
 * @returns {*} : the database connection
 */
module.exports = function (ip, port, dbName) {

    const dbUri = `mongodb://${ip}:${port}/${dbName}`;
    console.log(`Attempting connection to DB_URI ${dbUri}`);

    // DATABASE CONNECTION
    const mongoose = require('mongoose');
    const db = mongoose.connection;
    mongoose.set('strictQuery', true);

    db.on('error', console.error.bind(console, 'Error connecting to mongodb'));
    db.on('disconnected', () => console.log("[Mongoose] Disconnected"));

    /*
    Initial mongoose connection
     */
    const init = async () => {
        try {
            await mongoose.connect(dbUri, {
                autoIndex: true,
            });
        } catch (initError) {
            console.error("[Mongoose] ERROR on initial connection  to MongoDB " + initError);
        }
    }

     init();

    db.once("connected",
        () => {
        console.log(`[Mongoose] Connected to MongoDB at ${dbUri}`.yellow());
    });
    db.once('open', function callback() {
        console.log('\n\t[Mongoose] Connected to MongoDB\n'.yellow())
    })
    return db;
}