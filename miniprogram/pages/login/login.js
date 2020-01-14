
let app = getApp();
// 获取数据库引用
const db = wx.cloud.database();
const userListDB = db.collection('user');

let name = null;
let studentID = null;
Page({
  /**
   * 页面的初始数据
   */
  data: {

  },
  //输入学号
  inputStudentID(event) {
    studentID = event.detail.value;
  },
  //输入姓名
  inputName(event) {
    name = event.detail.value;
  },
  //注册
  getInitLocation() {
    wx.getLocation({
      type: 'gcj02',
      complete: (res) => {
        if (res.latitude) {
          app.globalData.initLongitude = res.longitude
          app.globalData.initLatitude = res.latitude
          app.globalData.isAuthorized = true
        }

        wx.switchTab({
          //目的页面地址
          url: '../map/map',
          success: function (res) {
            console.log('登陆成功')
            console.log(app.globalData.initLatitude, app.globalData.initLongitude)
          }
        })
      }
    })
  },
  login() {
    let studentIDReg = /^160424[0-9]{4}$/;
    let nameReg = /^[\u4E00-\u9FA5]{2,4}$/;
    if (!studentIDReg.test(studentID)) {
      wx.showModal({
        content: '请输入正确的学号',
        showCancel: false
      })
      return
    }
    if (!nameReg.test(name)) {
      wx.showModal({
        content: '请输入正确的姓名',
        showCancel: false
      })
      return
    }  
    app.globalData.studentID = studentID
    app.globalData.name = name
    // 查询用户是否已经登陆过
    userListDB.where({
      _openid: app.globalData.openid // 填入当前用户 openid
    }).get({
      success: (res) => {
        let userInfos = res.data;
        console.log(1)
        if (userInfos && userInfos.length > 0) {
          console.log(2)
          console.log(userInfos)
          console.log(userInfos[0].name == name)
          if (userInfos[0].name == name && userInfos[0].studentID == studentID) {
            console.log('已经登录,跳转到跑步页面')
            this.getInitLocation()

          } else {
            if (studentID == null || name == null) {
              console.log('请输入完全')
              wx.showModal({
                title: '温馨提示',
                content: '学号或姓名不能为空',
                showCancel: false
              })
              return
            }
            console.log('请使用本人微信填写正确的学号和姓名')
            wx.showModal({
              title: '温馨提示',
              content: '请使用本人的微信并填写对应正确的学号和姓名',
              showCancel: false
            })
          }
        } else {
          this.saveuserinfo();
        }
      }
    })
  },
  saveuserinfo() {
    let that = this;
    if (studentID == null || name == null) {
      console.log('请输入完全')
      wx.showModal({
        title: '温馨提示',
        content: '学号或姓名不能为空',
        showCancel: false
      })
      return
    }
    userListDB.add({
      data: {
        // openid: app.globalData.openid,
        studentID: studentID,
        name: name
      }
    }).then(res => {
      console.log('首次登陆,跳转到跑步页面')
      this.getInitLocation()
    })
  },
})