wx.cloud.init({
  env: 'guochengdemo-30f7d',
  traceUser: true,
})
const db = wx.cloud.database();
const _ = db.command;
const userListDB = db.collection('user');


async function checkUserInfo(studentID,name) {
  let result = 0
  await userListDB.field({
    studentID: true,
    name: true
  }).get().then(res => {
    let data = res.data
    data.forEach((item) => {
      // console.log(item.studentID,studentID)
      if (item.name == name) result = 2
      if (item.studentID == studentID) result = 1
      // console.log(result)
    })
    // console.log(result)
  })
  // console.log(result)
  return result
}

export default checkUserInfo