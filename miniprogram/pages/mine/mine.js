// miniprogram/pages/mine/mine.js
const app = getApp();
const db = wx.cloud.database();
const userListDB = db.collection('user');

import * as echarts from '../../ec-canvas/echarts';
var chart = null;
let distance = 0;

function initChart(canvas, width, height) {
  chart = echarts.init(canvas, null, {
    width: width,
    height: height
  });
  canvas.setChart(chart);

  var option = {

  };
  chart.setOption(option, true);
  return chart;
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: '',
    studentID: '',
    date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`,
    isRanToday: false,
    distance: 0,
    hardRun: false,
    runDes: '',
    ec: {
      onInit: initChart
    }
  },
  // onshow: function () {
  //   onLoad();
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    wx.stopPullDownRefresh()
    this.getRunInfo().then(res => {
      console.log(res)
      if (res.data.length != 0) {
        this.setData({
          isRanToday: true,
          distance: res.data[0].runInfos[0].distance
        })
        distance = res.data[0].runInfos[0].distance
      } else {
        this.setData({
          isRanToday: false,
          distance: 0
        })
      }
    });
    setTimeout(() => {
      console.log(distance)
      console.log(this.data.isRanToday)
      console.log(this.data.distance)
      if(this.data.distance>3000) {
        this.setData({
          hardRun: true
        })
      }
      this.setInitInfo()
    },1000) 
    this.getUserInfo();
  },
  getUserInfo() {
    let name, studentID
    name = wx.getStorageSync('name')
    studentID = wx.getStorageSync('studentID')
    // console.log(app.globalData.name=='')
    // console.log(name,studentID)
    if (app.globalData.name != '') {
      this.setData({
        name: app.globalData.name,
        studentID: app.globalData.studentID
      })
    } else {
      this.setData({
        name: name,
        studentID: studentID
      })
    } 
  },

  async getRunInfo() {
    wx.showLoading({
      title: '请稍等~',
      mask: true
    })
    return await userListDB.where({
      _openid: app.globalData.openid,
      // name : `王国成`
      runInfos: {
        date: `${new Date().getFullYear()}/${new Date().getMonth() + 1}/${new Date().getDate()}`
        // date: `2020/1/23`
      }
    }).get();
  },

  setInitInfo() {
    var option = {
      backgroundColor: "rgba(0,0,0,.1)",
      color: ["#37A2DA", "#32C5E9", "#67E0E3"],
      series: [{
        // name: '业务指标',
        type: 'gauge',
        min: 0,
        max: 3000,
        axisLabel: {
          distance: -60
        },
        detail: {
          formatter: '{value}m'
        },
        axisLine: {
          show: true,
          lineStyle: {
            width: 20,
            shadowBlur: 0,
            color: [
              [0.3, '#67e0e3'],
              [0.7, '#37a2da'],
              [1, '#fd666d']
            ]
          }
        },
        data: [{
          value: distance,
          name: '里程'
        }]
      }]
    }
    setTimeout(() => {
      wx.hideLoading();
      if(chart) {
        chart.clear()
        chart.setOption(option);
      }
    }, 1500)
  },
  onPullDownRefresh() {
    this.onLoad();
  },
  cgUserInfo() {
    wx.navigateTo({
      url: '../reset/reset',
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