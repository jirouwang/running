// miniprogram/pages/users/users.js
let app = getApp();
// 获取数据库引用
const db = wx.cloud.database();
const userListDB = db.collection('user');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: '',
    userInfo: [],
    showName: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`
    })
    console.log('sortruninfo')
    wx.cloud.callFunction({
      name: 'getSortRunInfo',
      data: {},
      success: res => {
        let data = res.result.data
        let userInfo = []
        console.log(res.result.data)
        data.forEach(item => {
          userInfo.push({
            studentID: item.studentID,
            name: item.name,
            runInfo: item.runInfos[0]
          })
        })
        this.setData({
          userInfo
        })
      }
    })
  },

  showRunInfos() {
    console.log(this.data.userInfo)
  },
  chNameStuID() {
    this.setData({
      showName: !this.data.showName
    })
  }
})