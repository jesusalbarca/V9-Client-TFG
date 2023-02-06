const express = require('express');
const router = express.Router();


const ModelMessage = require("../../model/Message");


//OBTENER MENSAJES JSON
router.get('/get/allMessages', function (req, res) {
    // res.send('hola');
    ModelMessage.find({}, (err, messages) => {
        if (err) {
            return res.status(500).json({
                message: 'Error mostrando los servicios'
            })
        }
        res.send(messages);
        //   console.log(servicios);
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
        res.redirect('/mostrar_messages');
    })
});


module.exports = router;