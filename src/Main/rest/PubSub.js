const express = require('express');
const router = express.Router();

require("dotenv").config();
const jwtUtils = require("../../shared/middlewares/jwtUtils");

const bodyParser = require('body-parser');
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({limit: "50mb", parameterLimit: 50000, extended: true}));

/***
 * JWT Protected endpoints
 */

const jwt = require("jsonwebtoken")

// Modify the home endpoint as below
// to use the verifyTokenMiddleware
router.post("/protected", jwtUtils.verifyTokenMiddleware, async (req, res) => {

    const {user} = req;
    res.json({msg: `Welcome ${user.username}`});
});


const availableDevices = new Map();


const Device = require("../model/Device.js");

router.post("/devices/register", jwtUtils.verifyTokenMiddleware, async (req, res) => {


    console.log("DEVICES/REGISTER".magenta());


    const deviceInfo = {
        device_id: req.body.device_id,
        interface_id: req.body.interface_id,
        ips_device: req.body.ips_device,
        mac_device: req.body.mac_device,
        gateways: req.body.gateways
    }

    const device = new Device({
        macAddress: deviceInfo.mac_device,
        alias: "Gafas1",
        user: req.user.username
        // Add to database
    });

    device.save().then((a) => console.log("registered a new device" + a));


});




/*
    Allows a device to notify the network that it is available to receive messages
*/
router.post("/devices/subs", jwtUtils.verifyTokenMiddleware, async (req, res) => {


    console.log("DEVICES/SUBS".magenta());


    console.log(req.user);

    const deviceInfo = {
        device_id: req.body.device_id,
        interface_id: req.body.interface_id,
        ips_device: req.body.ips_device,
        mac_device: req.body.mac_device,
        gateways: req.body.gateways
    }
    availableDevices.set(req.body.device_id, deviceInfo)
    console.log(`Registered new available device: w/ id='${deviceInfo.device_id}' @${deviceInfo.ips_device}`)
    console.log(availableDevices)


    // Updating global variable
    req.app.locals.availableDevices = availableDevices;


    res.send("Registered new available device ")
})


/*
    Allows a device to notify the network that it no longer avaiable messages
*/
router.post("/devices/unsubs", jwtUtils.verifyTokenMiddleware, async (req, res) => {


    console.log(req.body)

    const deviceInfo = {
        device_id: req.body.device_id,
        mac_device: req.body.mac_device
    }

    availableDevices.delete(deviceInfo.device_id)

    console.log(`Unregistered available device w/ id='${deviceInfo.device_id}'`)
    console.log(availableDevices)

    // Updating global variable
    req.app.locals.availableDevices = availableDevices;
    res.send("Unregistered available device ");

});


// Lists all the connected devices
router.get("/devices", async (req, res) => {


    // console.log("ASKED FOR DEVICES")


    // res.json(JSON.stringify(Object.fromEntries(writeMe.entries())));
    res.json(Object.fromEntries(availableDevices.entries()));
    // console.log(availableDevices)

})


module.exports = router;

