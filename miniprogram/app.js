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
      checkRunningToday: false,
    }

    // console.log(123)
    // wx.switchTab({
    //   url: '../pages/map/map',
    // })
    // console.log(456)

    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.openid = res.result.openid
        // console.log(res.result.openid)
        userListDB.where({
          _openid: res.result.openid
        }).get().then(res => {
          if(res.data.length!=0) {
            this.globalData.studentID = res.data[0].studentID,
            this.globalData.name = res.data[0].name
            console.log(res.data[0].studentID, res.data[0].name)
          }
          
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
      }
    })
    
  }


})
