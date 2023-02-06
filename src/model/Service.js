/*
     Service database model:  Represents a set of grpc definition (a set of functions to call) to allow grouping them in the same 'namespace'
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Other model dependencies
const Grpc = require("./RPC");

// Model definition
const serviceSchema = new Schema({
    name: String,
    grpcs: [Grpc.schema]
}, {versionKey: false})


const Service = mongoose.model('services', serviceSchema);

module.exports = Service;