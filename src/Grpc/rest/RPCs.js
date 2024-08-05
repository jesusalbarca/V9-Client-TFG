/*

 */


const express = require('express');
const router = express.Router();

const ModelRPC = require("../model/RPC");
const {verifyTokenMiddleware} = require("../../shared/middlewares/jwtUtils");
const ModelUser = require("../../Main/model/User");



router.get('/rpcs', verifyTokenMiddleware, async function (req, res) {


    const theUser = await ModelUser.find({username: req.user.username});


    ModelRPC.find({user_id: theUser}, (err, rpcs) => {
        if (err) {
            return res.status(500).json({
                message: 'Error mostrando las RPCs'
            })
        }
        res.status(200).json(rpcs);

    })
});

router.delete('/rpcs/:id', verifyTokenMiddleware, async function (req, res) {



    ModelRPC.deleteOne({_id: req.params.id}, (err, deleted) => {
        if (err) {
            return res.status(500).json({
                message: 'Error eliminando las las RPCs'
            })
        }
        res.status(200).json({message: "RPC eliminada correctamente", deleted:deleted});

    })
});







module.exports = router;