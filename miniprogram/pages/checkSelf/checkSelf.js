// miniprogram/pages/checkSelf/checkSelf.js
const app = getApp();
let studentID,name
const db = wx.cloud.database();
const userListDB = db.collection('user');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    chState: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  handleCgState() {
    this.setData({
      cgState: !this.data.cgState
    })
  },
  getStudentID(e) {
    studentID = e.detail.value
  },
  getName(e) {
    name = e.detail.value
  },
  checkStudentID() {
    let studentIDReg = /^160424[0-9]{4}$/;
    console.log(studentID)
    if (!studentIDReg.test(studentID)) {
      wx.showModal({
        content: '请输入正确的学号!',
        showCancel: false,
        success: res => {
          if(res.confirm) return
        }
      })
      return
    }
    userListDB.where({
      _openid: app.globalData.openid,
      studentID: studentID
    }).get().then(res => {
      console.log(res)
      console.log(res.data.length)
      if(res.data.length!=0) {
        wx.showModal({
          content: '验证成功',
          showCancel: false,
          success: (res) => {
            if(res.confirm) {
              wx.navigateTo({
                url: '../reset/reset',
              })
            }
          }
        })
      }else {
        wx.showModal({
          content: '验证失败!',
          showCancel: false,
          success: (res) => {
            if(res.confirm) return
          }
        })
      }
    })
  },
  checkName() {
    let nameReg = /^[\u4E00-\u9FA5]{2,4}$/;
    console.log(name)
    if (!nameReg.test(name)) {
      wx.showModal({
        content: '请输入正确的姓名!',
        showCancel: false,
        success: res => {
          if (res.confirm) return
        }
      })
      return
    }
    userListDB.where({
      _openid: app.globalData.openid,
      name: name
    }).get().then(res => {
      console.log(res)
      console.log(res.data.length)
      if (res.data.length != 0) {
        wx.showModal({
          content: '验证成功',
          showCancel: false,
          success: (res) => {
            if (res.confirm) {
              wx.navigateTo({
                url: '../reset/reset',
              })
            }
          }
        })
      } else {
        wx.showModal({
          content: '验证失败!',
          showCancel: false,
          success: (res) => {
            if (res.confirm) return
          }
        })
      }
    })
  }
})