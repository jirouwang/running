let app = getApp();
const db = wx.cloud.database();
const userListDB = db.collection('user');
// 跑步每秒记得点的坐标
const points = []
// 跑步时间
let runtime = 0

// 因为第一次计算distance的时候会有时候出现较大偏差,所以给个状态,如果第一个distance过大则变为0
let isFirstCountDistance = true

// 记录是否第一次点开始跑步
let isFirstStart = true

function format(time) {
  if(time<60) {
    let seconds = time.toString().padStart(2,"0")
    return `00:00:${seconds}`
  }else if(60<=time<3600) {
    let seconds = (time % 60).toString().padStart(2, "0")
    let minutes = Math.floor(time / 60).toString().padStart(2, "0")
    return `00:${minutes}:${seconds}`
  }else if(time>=3600) {
    let seconds = (time % 60).toString().padStart(2, "0")
    let minutes = ((time - Math.floor(time / 3600) * 3600) / 60).toString().padStart(2, "0")
    let hours = Math.floor(time / 3600).toString().padStart(2, "0")
    return `${hours}:${minutes}:${seconds}`
  }
}

Page({
  data: {
    id: '',
    // longitude: app.globalData.initLogitude,
    // latitude: app.globalData.initLatitude,
    longitude: 0,
    latitude: 0,
    polyline: [{
      points: [],
      color: 'red',
      borderColor: 'green',
      width: 5
    }],
    runtime: 0,
    distance: 0,
    // 定位的授权
    isAuthorized: false,
    // 控制跑步信息界面的状态
    showRunInfo: true,
    showRunInfoBtn: '-',
    // 是否暂停的状态
    isPaused: true,
    // 这个状态是记载同一次登录状态时,跑步完点结束后的当天跑步状态
    // 而如果用户第二次登陆又点击开始跑步的话,这个状态会重置. 而login的isRanToay方法则是在登录时获取用户当天是否跑过步的状态
    isRanToday: false,
    isTipShow: true
  },
  // onshow: function() {
  //   onLoad();
  // },
  onLoad: function () {
    console.log(app.globalData.studentID,app.globalData.name)
    this.setData({
      // 1.初始化map页面的经纬点
      // 2.给出定位的授权状态,有了地图和授权页面的切换
      isAuthorized: app.globalData.isAuthorized,
      longitude: app.globalData.initLongitude,
      latitude: app.globalData.initLatitude
    })
    // console.log(app.globalData.checkRunningToday)
  },
  // 根据经纬点的变化计算distance
  distance(la1, lo1, la2, lo2) {
    if (la1 === 0 || lo1 === 0) {
      return 0
    }
    if (la1 === la2 && lo1 == lo2) {
      return 0
    }
    let La1 = la1 * Math.PI / 180.0;
    let La2 = la2 * Math.PI / 180.0;
    let La3 = La1 - La2;
    let Lb3 = lo1 * Math.PI / 180.0 - lo2 * Math.PI / 180.0;
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(La3 / 2), 2) + Math.cos(La1) * Math.cos(La2) * Math.pow(Math.sin(Lb3 / 2), 2)));
    s = s * 6378.137;//地球半径
    s = Math.round(s * 10000) / 10000;
    if (isFirstCountDistance&&s*1000>5) {
      s = 0;
      isFirstCountDistance = false
    }
    return s * 1000
  },
  // 暂停事件
  clickStop() {
    this.data.id && clearInterval(this.data.id)
    this.setData({
      id: '',
      isPaused: true
    })
  },
  // 点击结束，可以选择重新跑步并初始化数据或者点击确定结束保存当天的跑步数据
  clickEnd() {
    // console.log(this.data.latitude, this.data.longitude) 
    this.data.id && clearInterval(this.data.id)
    this.setData({
      id: ''
    })
    if(this.data.runtime===0) {
      wx.showModal({
        title: '提示',
        content: '请先点击开始按钮进行跑步',
        showCancel: false,
        success: () => {
          return
        }
      })
      return
    }
    wx.showModal({
      title: '提示',
      content: '确定结束今天的跑步吗',
      cancelText: '重新跑步',
      success: (res) => {
        if(res.confirm) {
          wx.cloud.callFunction({
            name: 'updateInfo',
            data: {
              openid: app.globalData.openid,
              runtime: format(this.data.runtime),
              distance: this.data.distance
            }
          }).then((res) => {
            wx.showToast({
              title: '保存数据成功',
              duration: 1500,
              mask: true,
              success: () => {
                this.setData({
                  runtime: 0,
                  distance: 0,
                  polyline: [{
                    points: [],
                    color: 'red',
                    borderColor: 'green',
                    width: 5
                  }],
                  isPaused: true,
                  isRanToday: true
                })
              }
            })
            
          })
        }
        if(res.cancel) {
          isFirstStart = true;
          this.setData({
            runtime: 0,
            distance: 0,
            polyline: [{
              points: [],
              color: 'red',
              borderColor: 'green',
              width: 5
            }],
            isPaused: true,
            isRanToday: false
          })
        }
      }
    })
   
    this.setData({
      isRanToday: true
    })
    
  },
  clickStart() {
    // 这里做当天跑过了没的确认....好像没必要..
    // this.isRanToday()
    // 分为两种情况,一种是跑了又马上点开始跑步的,一种是跑了之后隔了一段时间重新登录后又点击开始跑步的
    if(this.data.isRanToday || app.globalData.checkRunningToday) {
      wx.showModal({
        title: '温馨提示',
        showCancel: false,
        content: '今天已经跑步了,休息一下,明天继续',
        success: () => {
          return
        }
      })
      return
    }
    // console.log(app.globalData.initLatitude)
    if(this.data.id) return
    // if(app.globalData.initLatitude == 0) {
    if (isFirstStart) {
      wx.showToast({
        title: '开始跑步!!',
        mask: true,
        image: '../../assets/image/加油.png'
      })
      isFirstStart = false
    }else {
      wx.showToast({
        title: '继续跑步!!',
        mask: true,
        image: '../../assets/image/加油.png'
      })
    }

    // login页面跳转到map页面的时候获取过一次经纬点,那是为了初始化地图,让地图显示出来
    // 这里再获取一次经纬点是因为用户登进来之后可能不会原地立即点开始跑步,所以需要点开始的的时候再获取一次初始的经纬点
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude,
          // isAuthorized: true
        })
      }
    })

    // 利用setinterval定时器1s获取一次经纬点并刷新map,更新跑步时间
    // 但由于setinterval本身的缺点,可能数据获取不太准确
    const id = setInterval(() => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const latitude = res.latitude
          const longitude = res.longitude
          points.push({
            latitude,
            longitude
          })
          console.log(latitude, longitude)
          let distance = this.distance(this.data.latitude, this.data.longitude, latitude, longitude)
          console.log(distance)
          this.setData({
            latitude,
            longitude,
            polyline: [{
              points,
              color: 'red',
              borderColor: 'green',
              width: 5
            }],
            distance: (Number(this.data.distance) + Number(distance)).toFixed(1)
          })
        }
      })
      this.setData({
        runtime: this.data.runtime + 1
      })
    }, 1000)
    this.setData({
      id,
      isPaused: false
    })
  },
  // 授权定位信息页面的btn方法
  getLocation() {
    wx.getSetting({
      success: (res) => {
        console.log(res)
        console.log(this.data.isAuthorized)
        // 检查用户的定位授权情况,不授权不能切换成地图页面
        if (!res.authSetting['scope.userLocation']) {
          wx.showModal({
            title: '是否授权当前位置',
            content: '需要获取您的地理位置,请确认授权,否则地图功能将无法使用',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting({
                  success: (res) => {
                    console.log(res)
                    if (res.authSetting["scope.userLocation"] === true) {
                      console.log('授权成功')
                      app.globalData.isAuthorized = true
                      // 授权成功则切换到地图页面并初始化
                      wx.getLocation({
                        type: 'gcj02',
                        success: (res) => {
                          this.setData({
                            isAuthorized: true,
                            latitude: res.latitude,
                            longitude: res.longitude
                          })
                        }
                      })
                      wx.showToast({
                        title: '授权成功',
                        icon: 'success',
                        mask: true,
                        duration: 1500
                      })

                    }
                  }
                })

              }
            }
          })
        }
      }
    })
  },
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
            // console.log(111111111111111111)
            app.globalData.checkRunningToday = true
            return
          }
        })
      }
    })
  },
  // 收起/展开跑步信息窗口的按钮的符号
  // 做法可以优化
  showInfoBtn() {
    if(this.data.showRunInfo) {
      this.setData({
        showRunInfoBtn: '+',
        showRunInfo: !this.data.showRunInfo
      })
    } else {
      this.setData({
        showRunInfoBtn: '-',
        showRunInfo: !this.data.showRunInfo
      })
    }
  },
  tipOut() {
    this.setData({
      isTipShow: false
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