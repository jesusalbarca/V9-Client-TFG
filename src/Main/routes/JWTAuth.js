
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");




router.post("/login", (req, res) => {
    const {username, password} = req.body;

    console.log("jwt - Login request".magenta())


    //TODO: Change this to a database query
    if (username === "alreylz" && password === "01241851") {

        const jwt_payload = {username};

        const token = jwt.sign(jwt_payload, process.env.JWT_SECRET_KEY, {
            expiresIn: '1h'
        });

        return res.json({username, token, msg: "Login Success"});
    }
    return res.json({msg: "Invalid Credentials"});
});



module.exports = router;