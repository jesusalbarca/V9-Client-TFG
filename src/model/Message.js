/*
     Message database model:  Represents a grpc shared datatype definition
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema;


// const messageSchema = new Schema({
//     name: String,
//     types: Array
// }, {versionKey: false})
//


const MessageField = require("./MessageField");

//
const MessageSchema = new Schema({
    messageName: String,
    messageFields: [MessageField.schema]
}, {versionKey: false});


// module.exports = mongoose.model('messages', messageSchema)

const Message = mongoose.model('messages', MessageSchema);

module.exports = Message;


//
//
// let fieldX = new MessageField({
//     dataName: "x",
//     dataType: "int32"
// })
//
// let fieldY = new MessageField({
//     dataName: "y",
//     dataType: "int32"
// })
//
//
// let nuMessage = new Message({
//         messageName: "Request",
//         messageFields: [fieldX, fieldY]
//     }
// )
//
// nuMessage.save().then((s) => console.log(s));
