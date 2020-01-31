// miniprogram/pages/users/users.js
let app = getApp();
// 获取数据库引用
const db = wx.cloud.database();
const userListDB = db.collection('user');

// 因为timepicker的时间格式为2020-01-31
// 而我需要的格式为2020/1/31,所以需要格式化
function formatDate(date) {
  let newDates = date.replace(/-/g, '/')
  let month = date.substring(5, 6);
  let day = date.substring(8, 9);
  console.log(month,day)
  if (month == 0) {
    let newMonth = newDates.substring(0,5);
    let newDate = newDates.substring(6,10);
    console.log(newMonth+newDate)
    return newMonth + newDate
  }
  if (day == 0) {
    let newMonth = newDates.substring(0, 8);
    let newDate = newDates.substring(9, 10);
    console.log(newMonth + newDate)
    return newMonth + newDate
  }
  return newDates
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 当天的时间
    date: '',
    // 用户选择的时间
    chooseDate: '',
    userInfo: [],
    isFull: false,
    // 学号与姓名的切换状态
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
      date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`,
      chooseDate: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`
    })
    console.log('sortruninfo')
    wx.showLoading({
      title: '正在拉取数据',
      mask: true
    })
    console.log(this.data.date)
    this.getSortRunInfo(this.data.date)
  },

  getSortRunInfo(date) {
    console.log(date)
    wx.cloud.callFunction({
      name: 'getSortRunInfo',
      data: {
        date: date
      },
      success: res => {
        let data = res.result.data
        console.log(data)
        if (data.length == 0) {
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
  bindDateChange(e) {
    wx.showLoading({
      title: '正在拉取数据',
      mask: true
    })
    console.log('picker发送选择改变，携带值为', e.detail.value)
    let newDate = formatDate(e.detail.value)
    this.setData({
      chooseDate: newDate
    })
    this.getSortRunInfo(newDate);
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