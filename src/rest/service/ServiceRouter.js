const express = require('express');
const router = express.Router();

const ModelService = require('../../model/Service');


var servicio_delete = "";


//OBTENER SERVICIOS JSON
router.get('/get/allServices', function (req, res) {

    ModelService.find({}, (err, servicios) => {
        if (err) {
            return res.status(500).json({
                message: 'Error mostrando los servicios'
            })
        }
        res.send(servicios);
    })
});
//ELIMINAR SERVICIO
router.get('/delete_service/:id/:name', function (req, res) {
    const id = req.params.id;
    ModelService.findByIdAndRemove(id, (err, service) => {
        if (err) {
            return res.status(500).json({
                message: 'Error eliminando al message'
            })
        }
        servicio_delete = req.params.name;
        res.redirect('/mostrar_servicios');
    })

});


module.exports = router;