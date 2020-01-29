// miniprogram/pages/reset/reset.js
const app = getApp();
const db = wx.cloud.database();
const userListDB = db.collection('user');

let studentID, name
let isInfoOK = true

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(getCurrentPages())
  },

  inputStudentID(event) {
    studentID = event.detail.value;
  },

  inputName(event) {
    name = event.detail.value;
  },

  reset() {
    wx.showLoading({
      title: '请稍等~',
      mask: true
    })
    isInfoOK = true
    let studentIDReg = /^160424[0-9]{4}$/;
    let nameReg = /^[\u4E00-\u9FA5]{2,4}$/;
    if (!studentIDReg.test(studentID)) {
      wx.hideLoading();
      wx.showModal({
        content: '请输入正确的学号,格式:160424****',
        showCancel: false
      })
      return
    }
    if (!nameReg.test(name)) {
      wx.hideLoading();
      wx.showModal({
        content: '请输入正确的姓名',
        showCancel: false
      })
      return
    } 
    userListDB.field({
      studentID: true,
      name: true,
      _openid: true
    }).get().then(res => {
      let data = res.data
      this.checkUserInfo(data)
    })
  },

  checkUserInfo(data) {
    if (name == app.globalData.name && studentID == app.globalData.studentID) {
      wx.hideLoading();
      console.log('请填写新的学号或姓名!')
      wx.showModal({
        content: '请填写新的学号或姓名!',
        showCancel: false
      })
      isInfoOK = false
    } 
    // data.forEach((item) => {
    for(let i=0; i<data.length; i++) {
      // console.log(app.globalData.name)
      // console.log(app.globalData.studentID)
      if (data[i]._openid != app.globalData.openid) {
        if (data[i].studentID == studentID) {
          wx.hideLoading();
          console.log('学号已被注册!')
          wx.showModal({
            content: '学号已被注册!',
            showCancel: false
          })
          isInfoOK = false
        }else if (data[i].name == name) {
          wx.hideLoading();
          console.log('姓名已被注册!')
          wx.showModal({
            content: '姓名已被注册!',
            showCancel: false
          })
          isInfoOK = false
        }
      } 
    }
    if (isInfoOK) {
      wx.hideLoading();
      console.log('学号姓名可以用')
      console.log(studentID,name)
      wx.showModal({
        content: '当前学号密码可用,是否确认修改?',
        success: (res) => {
          if(res.confirm) {
            wx.setStorage({
              key: 'name',
              data: name,
            });
            wx.setStorage({
              key: 'studentID',
              data: studentID
            })
            app.globalData.studentID = studentID;
            app.globalData.name = name;
            wx.cloud.callFunction({
              name: 'resetInfo',
              data: {
                openid: app.globalData.openid,
                studentID: studentID,
                name: name
              }
            })
            wx.showToast({
              title: '修改成功!',
              mask: true,
              duration: 1000,
              success: res => {
                wx.reLaunch({
                  url: '../login/login',
                  success: () => {
                    console.log('跳转到登录界面')
                  }
                })
              }
            })
          }
        }
      })
    }
  }
})