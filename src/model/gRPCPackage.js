const mongoose = require('mongoose')
const Schema = mongoose.Schema


const Message = require('mongoose').model('messages');
const Service = require('mongoose').model('services');




/*
     Message database model:  Represents a grpc shared datatype definition
 */
const grpcPackageSchema = new Schema({
    name: String,
    messages: [Message.schema],
    services: [Service.schema]
}, {versionKey: false})


//Mongoose automatically looks for the plural, lowercased version of your model name.
//Compilo el modelo (luego podré hacer new
const GrpcPackage = mongoose.model('GrpcPackage', grpcPackageSchema);




















// Creo 2 mensajes de ejemplo
let msgType1 = new Message({
    name: "ReplyA", types: [
        {tipo: "int32", typename: "cosa"},
        {tipo: "bool", typename: "cosa2"},
    ]
});
let msgType2 = new Message({
    name: "ReplyB", types: [
        {tipo: "int32", typename: "cosaB"},
        {tipo: "bool", typename: "cosaB2"},
    ]
});


const rpc1 = {"name": "miFuncion1", "request": "ReplyA", "reply": "ReplyB"};
const rpc2 = {"name": "miFuncion2", "request": "ReplyB", "reply": "ReplyA"};
const rpc3 = {"name": "miFuncion3", "request": "ReplyB", "reply": "ReplyA"};
const rpc4 = {"name": "miFuncion4", "request": "ReplyB", "reply": "ReplyA"};


let service1 = new Service({
        name:
            "servicioEjemplo",
        grpcs: [rpc1, rpc2]
    }
);
let service2 = new Service({
        name:
            "servicioEjemplo2",
        grpcs: [rpc3, rpc4]
    }
);


let examplePackage = new GrpcPackage({
    name: "MyPackage",
    messages: [msgType1, msgType2],
    services: [service1, service2]
})


examplePackage.save().then(a => console.log("saved package"));


module.exports = GrpcPackage;