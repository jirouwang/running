let app = getApp();
const points = []
let runtime = 0
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
    isAuthorized: false
  },
  onLoad: function () {
    this.setData({
      isAuthorized: app.globalData.isAuthorized,
      longitude: app.globalData.initLongitude,
      latitude: app.globalData.initLatitude
    })
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
    return s * 1000
  },
  clickEnd() {
    console.log(this.data.latitude, this.data.longitude)
    this.data.id && clearInterval(this.data.id)
  },
  clickStart() {
    // console.log(app.globalData.initLatitude)
    const id = setInterval(() => {
      wx.getLocation({
        type: 'gcj02',
        success: (res) => {
          const latitude = res.latitude
          const longitude = res.longitude
          const speed = res.speed
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
            distance: (Number(this.data.distance) + Number(distance)).toFixed(2)
          })
        }
      })
      this.setData({
        runtime: this.data.runtime + 1
      })
    }, 1000)
    this.setData({
      id
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
  }
})