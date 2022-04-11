const { rejects } = require('assert');
const fs = require('fs');
const { resolve } = require('path');
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
            console.log(docPath + files[index])
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


async function main() {
    let docPath = config.picDocPath + getCurrentDateDir() + '/temp/';
    let content = {};
    let files = await getDirFile(docPath);
    if(files.length!==0){
        content=await getFileContent(docPath,files);
        await delTempFile(docPath,files);
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


/**
 * @description 在线读取数据的定时任务执行的方法
 * 1.给定的文件目录中获取数据 getCurrentDateDir 
 * 2.读取该目录下的所有的txt名称
 * 3.确认db 文件加下是否存在data.json 不存在创建并且初始化,存在将数据读取出来转化为对象
 * 4.将读取出来的TXT转化为对象
 * 5.存储到文件中后根据txt名称删除对应的txt
 *
 */
function getUploadDealInfo() {
    //childProcess.exec(config.shell, (err, stdout, stderr) => {  })

    let content = {
        list: [],
        total: 0
    }
    let files = [];
    let docPath = config.picDocPath + getCurrentDateDir() + '/temp/';
    docPath = "./test/22-04-11/temp/";
    console.log(docPath)
    let p = new Promise((resolve, rejects) => {
        fs.readdirSync(docPath).forEach((file) => {
            files.push(file)
        })
        resolve(files);
    }).then(value => {
        console.log(value)
        let count = 0;
        value.forEach(item => {
            let fileStream = fs.readFileSync(docPath + item).toString();
            let fileObj = changeFileToObj(fileStream);
            content.list.push(fileObj)
            count++;
        })
        content.total += count;
        return new Promise((resolve, rejects) => {
            // let count = 0;
            // value.forEach(item => {
            //     let fileStream = fs.readFileSync(docPath + item).toString();
            //     let fileObj = changeFileToObj(fileStream);
            //     content.list.push(fileObj)
            //     count++;
            // })
            // content.total += count;
            resolve({ value: value, content: content })
        })
        //return { files: files, content: content }
        //})
    }).then(data => {
        console.log(data)
        return new Promise((resolve, rejects) => {
            for (let index = 0; index < data.value.length; index++) {
                console.log(docPath +  data.value[index])
                fs.unlink(docPath +  data.value[index], function (error) {
                    if (error) {
                        rejects({
                            code: 500,
                            msg: '删除文件失败',
                        })
                    }
                });
                //删除完所有的文件后在返回数据
                if (index + 1 == data.value.length) {
                    resolve({
                        code: 200,
                        msg: '成功',
                        data: data.content
                    })
                }
            }
        })

    }).catch(err => {
        return new Promise((resolve, rejects) => {
            rejects({
                code: 500,
                msg: err
            })
        })
        
    })
    return p;
    //let result = {};
    // 先执行脚本
    // try {
    //     childProcess.exec(config.shell, (err, stdout, stderr) => {
    //     })
    // } catch (error) {
    //     result={
    //         code: 500,
    //         msg: '脚本错误'
    //     }
    //     return result;
    // }
    // step 1
    //let docPath = config.picDocPath + getCurrentDateDir() + '/temp/';
    //step 2 

    // try {
    //     fs.readdirSync(docPath).forEach((file) => {
    //         files.push(file)
    //     })
    // } catch (error) {
    //     result = {
    //         code: 500,
    //         msg: '目录不存在'
    //     }
    //     return result;
    // }
    //step 3 
    // let content = {
    //     list: [],
    //     total: 0
    // };
    //step 4 
    // try {
    //     let count = 0;
    //     files.forEach(item => {
    //         console.log(docPath + item)
    //         let fileStream = fs.readFileSync(docPath + item).toString();
    //         let fileObj = changeFileToObj(fileStream);
    //         content.list.push(fileObj)
    //         count++;
    //     })
    //     content.total += count
    // } catch (error) {
    //     result = {
    //         code: 500,
    //         msg: '文件转对象失败'
    //     }
    //     return result;

    // }
    //step 5

    // for (let index = 0; index < files.length; index++) {
    //     console.log(docPath + files[index])
    //     fs.unlink(docPath + files[index], function (error) {
    //         if (error) {
    //             console.log(error);
    //             return {
    //                 code: 500,
    //                 msg: '删除文件失败',
    //             };
    //         }
    //         // console.log("删除文件" + files[index]);
    //     });
    //     //删除完所有的文件后在返回数据
    //     if (index + 1 == files.length) {
    //         result = {
    //             code: 200,
    //             msg: '成功',
    //             data: JSON.parse(content)
    //         }
    //         return result;
    //     }
    // }

}

//getUploadDealInfo().then(res => { console.log(res) }).catch(err => { console.log(err) })
// function main(file) {
//     let result = {}
//     result = uploadFun.deleteall(uploadFolder)
//     if (result.code !== 500) {
//         let fileList = [];
//         req.files.map((elem) => {
//           fileList.push({
//             filename: elem.filename,
//             filepath: 'upload/' + elem.filename
//           })
//         });
//         console.log(fileList)
//         result = uploadFun.getUploadDealInfo();
//         res.status(result.code).send(result)
//       }
// }



 exports.deleteall = deleteall;
// exports.getUploadDealInfo = getUploadDealInfo;
exports.main = main;