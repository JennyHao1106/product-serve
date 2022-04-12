const fs = require('fs');
const childProcess = require("child_process");
let config;
if (process.env.NODE_ENV == 'production') {
    config = require('../prod.js')
} else {
    config = require('../dev.js')
}
let dbFilePath = './db/data.json';
/**
 * 获取给定的目录文件名称，定时任务，每天更新
 * @returns 目录名称 例：22-04-01
 */
function getCurrentDateDir() {
    let dirName = "";
    let nowTime = new Date();
    let year = nowTime.getFullYear().toString().slice(2);
    let month = (nowTime.getMonth() + 1).toString().length < 2 ? '0' + (nowTime.getMonth() + 1).toString() : (nowTime.getMonth() + 1).toString();
    let day = nowTime.getDate().toString().length < 2 ? '0' + nowTime.getDate().toString() : nowTime.getDate().toString();
    dirName = year + '-' + month + '-' + day
    return dirName
}

function changeFileToObj(data) {
    let arr = data.split("\n");
    let obj = {};
    arr.forEach((item) => {
        if (item.split(":").length > 1) {
            let objName = item.split(":")[0].trim();
            let objVal = item.split(":")[1];
            obj[objName] = objVal.trim();
        }
    });
    return obj;
}


/**
 * @description 在线读取数据的定时任务执行的方法
 * 1.给定的文件目录中获取数据 getCurrentDateDir 
 * 2.读取该目录下的所有的txt名称
 * 3.确认db 文件加下是否存在data.json 不存在创建并且初始化,存在将数据读取出来转化为对象
 * 4.将读取出来的TXT转化为对象
 * 5.存储到文件中后根据txt名称删除对应的txt
 *
 */
function onlineDataJob() {
    // step 1
    let docPath = config.picDocPath + getCurrentDateDir() + '/labels/';
    //step 2 
    let files = [];
    try {
        fs.readdirSync(docPath).forEach((file) => {
            files.push(file)
        })
    } catch (error) {
        console.log("目录不存在")
    }
    //step 3 
    let content = {};
    try {
        let initData = { list: [], total: 0 };
        if (!fs.existsSync(dbFilePath) || (fs.existsSync(dbFilePath) && (JSON.parse(fs.readFileSync(dbFilePath)).toString().length == 0))) {
            fs.writeFileSync(dbFilePath, JSON.stringify(initData))
        }
        content = JSON.parse(fs.readFileSync(dbFilePath))
    } catch (error) {
        console.log("job-初始化文件报错")
    }
   
    //step 4 
    try {
        let count = 0;
        files.forEach(item => {
            console.log(docPath + item)
            let fileStream = fs.readFileSync(docPath + item).toString();
            let fileObj = changeFileToObj(fileStream);
            content.list.push(fileObj)
            count++;
        })
        content.total += count
    } catch (error) {
        console.log(error)
        console.log("文件转对象失败")
    }
    //step 5
    // try {
    fs.writeFile(dbFilePath, JSON.stringify(content), (err) => {
        if (err) {
            console.log("重写失败：", err);
            return;
        } else {
            for (let index = 0; index < files.length; index++) {
                console.log(docPath + files[index])
                fs.unlink(docPath + files[index], function (error) {
                    if (error) {
                        console.log(error);
                        return false;
                    }
                    console.log("删除文件" + files[index]);
                });
            }
        }
    })
}

exports.onlineDataJob = onlineDataJob;
exports.getCurrentDateDir = getCurrentDateDir;
