/***
 * @fileOverview : Defines & implements the REST API endpoints for Packages (groups of Services defined by the user via GUI, which are to be converted into .proto files for execution)
 */
const express = require('express');
const router = express.Router();
require("dotenv").config();


const ModelUser = require('../../Main/model/User');

const ModelService = require('../model/Service');
const ModelPackage = require('../model/GrpcPackage');
const grpcHelpers = require("../grpcHelpers");


const {verifyTokenMiddleware} = require("../../shared/middlewares/jwtUtils");
const ModelRPC = require("../model/RPC");


router.get('/packages', verifyTokenMiddleware,
    async function (req, res) {

        console.log("REST GET /packages \n".yellow() + " user: " + JSON.stringify(req.user));


        const user = await ModelUser.findOne({username: req.user.username});


        const packagesByUser = await ModelPackage({user_id: user})


        return res.status(200).json(packagesByUser);
    });

router.post('/packages', verifyTokenMiddleware,
    async function (req, res) {

        console.log("REST POST /packages \n".yellow() + " user: " + JSON.stringify(req.user));

        const user = await ModelUser.findOne({username: req.user.username});


        // const services = await ModelService.find({name: {$in: req.services.name}});


        const services = await ModelService.find({name: {$in: req.body.services.map(s => s.name)}, user_id: user._id});


        console.log(`FOUND ${req.body.services}`);


        console.log(req.body)
        const newPackage = new ModelPackage({
            name: req.body.name,
            description: req.body.description || "",
            services: services,
            user_id: user._id
        });
        newPackage.save();


        console.log("COMPILING TO PROTO FILE".red());

        await grpcHelpers.generateProtofileFromPackageDefinition(newPackage);


        return res.status(200).json(newPackage)
    });


router.delete('/packages/:id', verifyTokenMiddleware,
    async function (req, res) {

        console.log("REST REMOVE /packages \n".yellow() + " user: " + JSON.stringify(req.user));


        try {
            const user = await ModelUser.findOne({username: req.user.username});


            console.log(`FOUND AND ABOUT TO DELETE  PACKAGE ${req.params.id} for user ${user}`);

            const removed = await ModelPackage.findOneAndRemove({_id: req.params.id});


            if (!removed)
                res.status("404").json({
                    error: "Not found",
                    details: `Package with id '${req.params.id}' does not exist`
                });


            return res.status(200).json(removed)

        } catch (e) {

            return res.status(500).json({error: "Exception", details: `${e}`})
        }


    });


module.exports = router;