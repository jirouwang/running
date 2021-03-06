import checkUserInfo from '../../utils/utils.js'
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

  onLoad: function() {
    // console.log(getCurrentPages())
    // console.log(app.globalData.openid)
  },

  inputStudentID(event) {
    studentID = event.detail.value;
  },

  inputName(event) {
    name = event.detail.value;
  },

  // 初始化map的经纬点并跳转到map
  getInitLocation() {
    wx.showLoading({
      title: '请稍等~',
      mask: true
    })
    wx.getLocation({
      type: 'gcj02',
      complete: (res) => {
        if (res.latitude) {
          app.globalData.initLongitude = res.longitude
          app.globalData.initLatitude = res.latitude
          app.globalData.isAuthorized = true
        }
        wx.hideLoading();

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
        content: '请输入正确的学号,格式:160424****',
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
    
    // 查询用户是否已经登陆过
    userListDB.where({
      _openid: app.globalData.openid 
    }).get({
      success: (res) => {
        let userInfos = res.data;
        // console.log(1)
        // 不同微信第一次登录注册的时候没有检测学号和姓名是否重复!!!!!!!!!
        // 可以另外写一个utils文件写查重的功能
        
        // 根据openid又返回的信息,证明之前登陆注册过
        if (userInfos && userInfos.length > 0) {
          console.log(2)
          console.log(userInfos)
          console.log(userInfos[0].name == name)
          // 如果输入的学号姓名与数据库里的对应则允许登陆
          if (userInfos[0].name == name && userInfos[0].studentID == studentID) {
            console.log('已经登录,跳转到跑步页面')
            wx.setStorage({
              key: 'name',
              data: name,
            });
            wx.setStorage({
              key: 'studentID',
              data: studentID
            })
            app.globalData.studentID = studentID
            app.globalData.name = name
            this.isRanToday()
            this.getInitLocation()
          } else {
            // if (studentID == null || name == null) {
            //   console.log('请输入完全')
            //   wx.showModal({
            //     title: '温馨提示',
            //     content: '学号或姓名不能为空',
            //     showCancel: false
            //   })
            //   return
            // }
            console.log('请使用本人微信填写正确的学号和姓名')
            wx.showModal({
              title: '温馨提示',
              content: '请使用本人的微信并填写对应正确的学号和姓名',
              showCancel: false
            })
          }
          // 这里加checkUserInfo的判断
          // 第一次登录注册,检测学号和姓名的重复性
        } else {
          let res = checkUserInfo(studentID,name)
          res.then((res)=>{
            console.log(res)
            if (res == 1) {
              wx.showModal({
                title: '提示',
                content: '学号已被注册',
                showCancel: false
              })
            } else if (res == 2) {
              wx.showModal({
                title: '提示',
                content: '姓名已被注册',
                showCancel: false
              })
              // 学号和姓名不重复,则注册成功,将学号和姓名存入数据库
            } else {
              this.saveuserinfo();
            } 
          })  
        }
      }
    })
  },
  saveuserinfo() {
    // let that = this;
    // if (studentID == null || name == null) {
    //   console.log('请输入完全')
    //   wx.showModal({
    //     title: '温馨提示',
    //     content: '学号或姓名不能为空',
    //     showCancel: false
    //   })
    //   return
    // }
    app.globalData.studentID = studentID
    app.globalData.name = name
    userListDB.add({
      data: {
        // openid: app.globalData.openid,
        studentID: studentID,
        name: name,
        runInfos: []
      }
    }).then(res => {
      console.log('首次登陆,跳转到跑步页面')
      wx.setStorage({
        key: 'name',
        data: name,
      });
      wx.setStorage({
        key: 'studentID',
        data: studentID
      })
      this.isRanToday()
      this.getInitLocation()
    })
  },

  // 检测当天是否跑过了
  isRanToday() {
    userListDB.where({
      _openid: app.globalData.openid,
    }).field({
      runInfos: true
    }).get({
      success: (res) => {
        let runInfos = res.data[0].runInfos
        console.log(runInfos)
        runInfos.forEach((item) => {
          let date = `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`
          if (item.date == date) {
            // console.log(2222222222222222222)
            app.globalData.checkRunningToday = true
            return
          }
        })
      }
    })
  },
  checkSelf() {
    wx.navigateTo({
      url: '../checkSelf/checkSelf',
    })
  },
  onShareAppMessage: function (res) {
    return {
      title: '跑步小程序',
      path: '/pages/login/login',
      imageUrl: '../../assets/image/跑步.jpg'
    }
  }
})