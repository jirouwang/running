let app = getApp();
const db = wx.cloud.database();
const userListDB = db.collection('user');
const points = []
let runtime = 0
let isFirstCountDistance = true

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
    isAuthorized: false,
    showRunInfo: true,
    showRunInfoBtn: '-',
    isPaused: true,
    isRanToday: false
  },
  onLoad: function () {
    this.setData({
      isAuthorized: app.globalData.isAuthorized,
      longitude: app.globalData.initLongitude,
      latitude: app.globalData.initLatitude
    })
    // console.log(app.globalData.checkRunningToday)
  },
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
  clickStop() {
    this.data.id && clearInterval(this.data.id)
    this.setData({
      id: '',
      isPaused: true
    })
  },
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
              title: '保存跑步数据成功!',
              duration: 1500,
              mask: true,
              success: () => {
                this.setData({
                  runtime: 0,
                  distance: 0,
                  isPaused: true
                })
              }
            })
            
          })
        }
        if(res.cancel) {
          this.setData({
            runtime: 0,
            distance: 0,
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
    this.isRanToday()
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
  getLocation() {
    wx.getSetting({
      success: (res) => {
        console.log(res)
        console.log(this.data.isAuthorized)
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
  }
})