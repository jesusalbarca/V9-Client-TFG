/*
     RPC database model:  Represents a grpc remote procedure call definition
 */
const mongoose = require('mongoose')
const Schema = mongoose.Schema

// Other model dependencies
const Message = require("./Message");

// Model definition
const RpcSchema = new Schema({
        //The name of the function
        rpcName: String,
        //The type of rpc (see grpc specification)
        rpcType: {
            type: String,
            enum: ['UNARY', 'SERVER_STREAMING', 'CLIENT_STREAMING', 'BIDIRECTIONAL'],
            default: 'UNARY'
        },
        //The return type of the function
        returnType: Message.schema,
        //The data that is sent along with the function (parameters)
        argsType: Message.schema
    }
);


const Grpc = mongoose.model('rpcs', RpcSchema)


module.exports = Grpc;


/*
    QUICK TESTING
 */


// const rpcTest = new Grpc(
//     {
//         rpcName: "myRemoteFunction",
//         returnType: new Message({
//             messageName: "returnedThinggy"
//         }),
//         argsType: new Message({
//             messageName: "parameters"
//         })
//     }
// )
//
//
// rpcTest.save().then(e => console.log(`saved a grpc function to db ${e}`))