// Custom middleware to check for a valid session
const checkSession = (req, res, next) => {

    console.log(" CHECKING WHETHER THE USER HAS LOGGED IN and has a valid SESSION")
    console.log(JSON.stringify(req.session));


    if (!req.session.user) {
        return res.redirect('/');
    }
    next();
};


module.exports = {checkSession}