const express = require('express');
const app = express();

require('dotenv').config();
const PORT = process.env.PORT || 3000;

app.get('/', function (req, res){
    res.status(200).json({token: "1234"});
});

const server = app.listen(PORT, function(){
    console.log(`Server is listening on PORT ${PORT}`);
})