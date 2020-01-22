// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();
const userListDB = db.collection('user');

// 云函数入口函数
exports.main = async (event, context) => {
  // const wxContext = cloud.getWXContext()
  return await userListDB.
  // field({
  //   runInfos: true,
  //   studentID: true,
  //   name: true
  // }).get()
  // 这个distance必须是number类型
    where({
      runInfos: {
        date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`
      }
    }).orderBy('runInfos.distance', 'desc').get()
  // return {
  //   event,
  //   openid: wxContext.OPENID,
  //   appid: wxContext.APPID,
  //   unionid: wxContext.UNIONID,
  // }
}