const cds = require("@sap/cds");
const cov2ap = require("@cap-js-community/odata-v2-adapter");
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
 
cds.on("bootstrap", (app) => { 
    app.use(cov2ap());
    app.use(express.json({ limit: '1gb' }));
    app.use(express.urlencoded({ limit: '1gb', extended: true }));
    app.use('/files', express.static(path.join(__dirname, 'files')));

 });
 
module.exports = cds.server;