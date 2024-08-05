/***
 * @fileOverview Implementa el uso
 */


const express = require('express');
const router = express.Router();

const ModelUser = require('../../Main/model/User');
const ModelMessage = require("../model/Message");
const {verifyJWT, verifyTokenMiddleware} = require("../../shared/middlewares/jwtUtils");
const ModelRPC = require("../model/RPC");


router.get('/messages', function (req, res) {


    ModelMessage.find({}, (err, messages) => {
        if (err) {
            return res.status(500).json({
                message: 'Error mostrando los messages'
            })
        }
        res.send(messages);

    })

});


router.post("/messages", verifyTokenMiddleware, async function (req, res) {


    console.log(" POST MESSAGES")

    //@todo finish this implementation
    //Tengo que restringir lo que puede ser messageFields
    // -> Tiene que ser uno de los tipos soportados (simples) o un tipo de message ya existente ; hay que hacer esas comprobaciones


    const nuMessage = new ModelMessage({
        messageName: req.body.messageName,
        messageFields: req.body.messageFields,
        user_id: await ModelUser.findOne({username: req.user.username}),
    });


    await nuMessage.save();


    return res.status(200).json(nuMessage)


});


router.delete('/messages/:id', function (req, res) {
    const id = req.params.id;
    ModelMessage.findByIdAndRemove(id, (err, message) => {
        if (err) {
            return res.status(500).json({
                message: 'Error eliminando al message'
            })
        }
        message_delete = req.params.name;
        res.redirect('/messages');
    })
});


//TODO: Remove this
//OBTENER MENSAJES JSON
router.get('/get/allMessages', function (req, res) {

    ModelMessage.find({}, (err, messages) => {
        if (err) {
            return res.status(500).json({
                message: 'Error mostrando los messages'
            })
        }
        res.send(messages);

    })
});

var message_delete = "";

//ELIMINAR MENSAJE
router.get('/delete_message/:id/:name', function (req, res) {
    const id = req.params.id;
    ModelMessage.findByIdAndRemove(id, (err, message) => {
        if (err) {
            return res.status(500).json({
                message: 'Error eliminando al message'
            })
        }
        message_delete = req.params.name;
        res.redirect('/messages');
    })
});


module.exports = router;