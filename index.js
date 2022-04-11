const express = require('express')

const app = express()

const port = 3000


const serve  = require("./serve/index")
const getJob = require('./serve/job')
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*'); //访问控制允许来源：所有
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Metheds', 'PUT, POST, GET, DELETE, OPTIONS'); //访问控制允许方法
    res.header('X-Powered-By', 'nodejs'); //自定义头信息，表示服务端用nodejs
    res.header('Content-Type', 'application/json;charset=utf-8');
    next();
});
app.use(express.static('public'))
app.get('/public/*', function (req, res) {
    res.sendFile(__dirname + "/" + req.url);
})
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})

app.use('/serve',serve)

// getJob.getCurrentDateDir();
// getJob.onlineDataJob();












