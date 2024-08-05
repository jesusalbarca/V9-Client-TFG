const express = require("express");
const path = require("path");
const axios = require("axios");
const User = require("../model/User");

const {UIStatusMessage} = require("../../shared/classes/UIStatusMessageNotificationSystem");

const router = express.Router();


const validationConfig = {
    minPasswordLength: 3
}


/**
 * Implements user authentication (cookie-based)
 *  - Sign up : via a form sent to the server and validated
 *  - Log in : via username and password. A session in the server is created on success (cookie)
 *  - Log out: destroys the session in the server (cookie)
 */


module.exports = function (options) {

    const UserAPIUri = options.UserAPIUri;
    http://localhost:3000/v1/


//CREAR CUENTA
    router
        .post("/signUp",

            async function (req, res) {

                console.log("INTENTO DE CREACIÓN DE CUENTA - request: ", req.body)

                // Object that holds all user data after validation
                const validated = {};

                const redirectUrlOnSuccess = "/home";
                const redirectUrlOnValidationError = "/";
                const redirectUrlOnInternalServerError = "/error";


                let status_msg = new UIStatusMessage("Login Successful", "Success", "success");
                let http_status_code = 200;

                // - Username in use?
                try {

                    //TODO: THESE LOCAL URLS CANT BE HARDCODED
                    const {data} = await axios.post("http://localhost:3000/api/v1/usernames/available", {username: req.body.username});
                    console.log(data.available);
                    if (!data.available) {
                        status_msg = new UIStatusMessage("Username already in use", "Error", "error");
                        return res.redirect("/");
                    }
                } catch (error) {
                    return res.status(500).send("Error processing the username " + error)
                }
                validated.username = req.body.username;
                // todo: Validate email
                validated.email = req.body.email;

                // todo: Make sure there is no code or weird characters in all fields
                // - Check passwords match
                const password = (req.body.password1 === req.body.password2) == true ? req.body.password1 : null;
                if (password === null) {
                    status_msg = new UIStatusMessage("Passwords don't match", "Error", "error");
                    return res.redirect("/");
                }

                // - Password the proper length
                if (!(typeof password == 'string' || password instanceof String) && password.length < validationConfig.minPasswordLength)
                    return res.status(http).send("Password is too short");

                //todo: hash password
                validated.password = password;

                //todo: prevent free text in name and surname (protect against XSS)
                validated.name = req.body.name;
                validated.surname = req.body.surname;


                let result = "";


                try {
                    result = await axios.post("http://localhost:3000/api/v1/users", validated)
                } catch (e) {
                    result = e;
                }






                req.session.status_msg = new UIStatusMessage(`The user ${validated.username} was created`, "Sign Up Success", "success");
                res.status(200).redirect("/")

            })


// INICIAR SESIÓN
    router
        .post("/signIn",

            async function (req, res) {
                console.log("INTENTO DE INICIO DE SESIÓN - request: ", req.body)


                try {

                    // Check user exists
                    const apiResponse = await axios.post("http://localhost:3000/auth", {
                        username: req.body.username, password: req.body.password,
                    });

                    req.session.logged = true;
                    req.session.username = req.body.username;


                    // Get all info from user

                    let fullUserInfo = await axios.get("http://localhost:3000/api/v1/users?username="+req.body.username);

                    console.log(fullUserInfo.data[0])

                    req.session.user = fullUserInfo.data[0];
                    // debugger;

                    req.session.action_history = [];
                    req.session.status_msg = new UIStatusMessage(`Welcome to the app, ${req.session.user}`, "Success", "success");

                    return res.status(200).redirect("/");


                } catch (e) {
                    req.session.status_msg = new UIStatusMessage("Login was not successful, username or password are incorrect", "Error", "error");
                    return res.status(401).redirect("/");
                }


            });

    router
        .get("/logOut",

            async function (req, res) {

                req.session.destroy(function (err) {
                    if (err) {
                        console.log("Error on logout", err);
                    }
                    else {
                        console.log(req.session)
                        res.redirect('/');
                    }
                });


            });


// TODO: Refactor (this probably should be in a different file) As of now, it is an endpoint that given a username and password, checks if access to the app should be allowed
    router
        .post("/auth",

            async function (req, res) {
                console.log(req.body);


                console.log("BUSCANDO CREDENCIALES EN BBDD", req.body)

                try {

                    const theUser = await User.findOne({username: req.body.username});

                    console.log(theUser)

                    if (!(req.body.username && req.body.password)) res.status(400).json({msg: "UUUU"})

                    if (theUser.password == req.body.password) {

                        console.log("password is correct")
                        return res.status(200).json({msg: "LOGIN SUCCESS"})

                    }
                    else {
                        res.status(401).json({msg: "LOGIN SUCCESS"})

                    }
                } catch (e) {
                    return res.status(500).json({msg: "Server error " + e})
                }

            });



    return router;

}