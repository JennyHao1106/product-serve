const { rejects } = require('assert');
const fs = require('fs');
const { resolve } = require('path');
const childProcess = require("child_process");

let config;
if (process.env.NODE_ENV == 'production') {
    config = require('../prod.js')
} else {
    config = require('../dev.js')
}


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
 * 删除文件夹下的所有文件
 * @param {*} path 目录
 */
function deleteall(path) {
console.log('upload-'+path)
    let files = []
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path)
        files.forEach(function (file, index) {
            let curPath = path + '/' + file
            fs.unlinkSync(curPath)
        })
        return {
            code: 200,
            msg: '删除成功'
        }
    } else {
        return {
            code: 500,
            msg: '删除目录不存在'
        }
    }
}

function getDirFile(path) {
    let files = []
    fs.readdirSync(path).forEach((file) => {
        files.push(file)
    })
    return files;
}

function getFileContent(docPath,files) {
    let content = {
        list: [],
        total: 0
    }
    let count = 0;
    files.forEach(item => {
        console.log(docPath + item)
        let fileStream = fs.readFileSync(docPath + item).toString();
        let fileObj = changeFileToObj(fileStream);
        content.list.push(fileObj)
        count++;
    })
    content.total += count;
    return content;
}

function delTempFile(docPath, files) {
    if (files.length > 0) {
        for (let index = 0; index < files.length; index++) {
            console.log('upload-'+docPath + files[index])
            fs.unlink(docPath + files[index], function (error) {
                if (error) {
                    return {
                        code: 500,
                        msg: '删除文件失败',
                    };
                }
            });
        }
    } else {
        return {
            code: 500,
            msg: '没有可删除的数据',
        }
    }

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
 function main() {
    let docPath = config.picDocPath + getCurrentDateDir() + '/term/';
    let content = {};
    let files =  getDirFile(docPath);
    if(files.length!==0){
        content= getFileContent(docPath,files);
        console.log('upload-'+docPath)
        delTempFile(docPath,files);
        return {
            code:200,
            data:content
        }
    }else{
        return {
            code:500,
            msg:'no files'
        }
    }
}

exports.deleteall = deleteall;
exports.main = main;
