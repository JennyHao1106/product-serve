
/**
 * @description 图片上传
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');

let uploadFolder = './public/upload' ;//规定上传文件的目录，使用相对路径

/**
 * @description 设置上传文件的信息，否则文件会被上传为二进制文件
 */
let storage = multer.diskStorage({
    destination: function(req, file, cb) { //设置存储位置
      cb(null, uploadFolder); 
    },
    filename: function(req, file, cb) { // 在这里设定文件名
      cb(null, Date.now() + '-' + file.originalname) // 加上Date.now()可以避免命名重复
    }
  })
 

let upload = multer({storage:storage})

/**
 * @description 多文件上传
 */
router.post('/upload', upload.array('file'), (req, res) => {
    console.log(req.files);
    let fileList = [];
    req.files.map((elem) => {
        fileList.push({
            filename: elem.filename,
        })
    });
    res.json({
        code: '200',
        type: 'multer',
        fileList: fileList
    });
});


module.exports = router;


