//app.js
wx.cloud.init({
  env: 'guochengdemo-30f7d',
  traceUser: true,
})
const db = wx.cloud.database();
const userListDB = db.collection('user');

App({
  onLaunch: function () {
    this.globalData = {
      openid: '',
      studentID: '',
      name: '',
      initLongitude: 0,
      initLatitude: 0,
      isAuthorized: false,
      checkRunningToday: false
    }

    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.openid = res.result.openid
        // console.log(res.result.openid)
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
  }


})
