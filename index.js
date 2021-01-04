const express = require('express');

const app = express();

app.get('/',(req,res)=>{
    res.sendFile(__dirname + '/index.html')
})

const PORT = 3000 || process.env.NODE_ENV;

app.listen(PORT,()=>{
    console.log("Server started");
})