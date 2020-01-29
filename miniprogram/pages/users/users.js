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
    isFull: false,
    showName: true
  },
  // onshow: function () {
  //   onLoad();
  // },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.stopPullDownRefresh()
    this.setData({
      date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`
    })
    console.log('sortruninfo')
    wx.showLoading({
      title: '正在拉取数据',
      mask: true
    })
    wx.cloud.callFunction({
      name: 'getSortRunInfo',
      data: {},
      success: res => {
        let data = res.result.data
        console.log(data)
        if(data.length == 0) {
          this.setData({
            isFull: true
          })
          wx.hideLoading();
          console.log('暂无跑步数据')
          return
        }
        let userInfo = []
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
        wx.hideLoading();
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
  },
  onPullDownRefresh() {
    this.onLoad();
  },
  onShareAppMessage: function (res) {
    return {
      title: '跑步小程序',
      path: '/pages/login/login',
      imageUrl: '../../assets/image/跑步.jpg'
    }
  }
})