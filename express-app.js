const express = require('express');
const app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use('/', express.static(__dirname + '/style/css/'));
app.use('/', express.static(__dirname + '/client-js/'));

app.set('view engine', 'ejs');


const ProtosRESTAPI = require("./src/rest/protos/ProtosRouter");
app.use("/", ProtosRESTAPI);
const ClientRouter = require("./src/client-endpoints/ClientRouter")
app.use("/", ClientRouter);

const ServiceRouter = require("./src/rest/service/ServiceRouter")
app.use("/", ServiceRouter);
const MessageRouter = require("./src/rest/message/MessageRouter")
app.use("/", MessageRouter);


module.exports = app;