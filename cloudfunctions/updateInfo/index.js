// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init()
const db = cloud.database();
const userListDB = db.collection('user');
const _ = db.command;



// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  let consult = false
  
  return await userListDB.where({
    _openid: event.openid
  }).update({
    data: {
      runInfos: _.unshift({
        runtime: event.runtime,
        distance: event.distance,
        date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`
      })
    }
  })
}