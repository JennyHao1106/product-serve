const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require("fs")
let uploadFun = require('./upload')


let uploadFolder = './public/upload';//规定上传文件的目录，使用相对路径
let readPath = './db/data.json'
/**
 * @description 设置上传文件的信息，否则文件会被上传为二进制文件
 */
let storage = multer.diskStorage({
  destination: function (req, file, cb) { //设置存储位置
    cb(null, uploadFolder);
  },
  filename: function (req, file, cb) { // 在这里设定文件名
    cb(null, Date.now() + '-' + file.originalname) // 加上Date.now()可以避免命名重复
  }
})


let upload = multer({ storage: storage })

/**
 * @description 多文件上传
 * 此功能用于临时使用，所使用的图片不留存
 * 1.将文件夹清空
 * 2.将图片写入
 * 3.获取分析后的结果TXT并写入temp.json文件
 * 4.将数据给到前台
 */
router.get('/delteDir', (req, res) => {
  let result = {};
  result = uploadFun.deleteall(uploadFolder);
  res.status(result.code).send(result)
})

router.post('/upload', upload.array('file'), async (req, res) => {
  let fileList = [];
  fileList = req.files.map((elem) => {
    return {
      filename: elem.filename,
      filepath: 'upload/' + elem.filename
    }
  });
  result = await uploadFun.main();
  res.status(result.code).send(result)
});
router.get('/list', (req, res) => {
  fs.readFile(readPath, "UTF-8", function (err, data) {
    let result = {};
    if (err) {
      result = {
        code: 500,
        msg: err,
      };
      res.status(500).send(result);
    } else {
      if (data.toString().trim().length == 0) {
        result = {
          code: 500,
          msg: "正在读取文件",
        };
        res.status(500).send(result);
      } else {
        let dataOfDb = JSON.parse(data.toString()).list;
        dataOfDb.reverse();
        result = {
          code: 200,
          data: {
            list: dataOfDb,
            total: dataOfDb.length,
          },
        };
        res.status(200).send(result);
      }

    }
  });
})

module.exports = router;


