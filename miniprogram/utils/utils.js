wx.cloud.init({
  env: 'guochengdemo-30f7d',
  traceUser: true,
})
const db = wx.cloud.database();
const _ = db.command;
const userListDB = db.collection('user');

function checkUserInfo(studentID,name) {
  
}