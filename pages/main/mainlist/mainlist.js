var app = getApp();
Page({
  data: {
    inputShowed: false,
    inputVal: "",
    stList: [],
    longitude: "",
    latitude: "",
  },
  showInput: function () {
    this.setData({
      inputShowed: true
    });
  },
  hideInput: function () {
    this.setData({
      inputVal: "",
      inputShowed: false
    });
  },
  clearInput: function () {
    this.setData({
      inputVal: ""
    });
  },
  inputTyping: function (e) {
    this.setData({
      inputVal: e.detail.value
    });
  },
  confirm: function (e) {
    this.showStlist(e.detail.value, false);
  },

  onLoad(option) {
    console.log(option);
    this.setData({
      longitude: option.longitude,
      latitude: option.latitude,
    })
    this.showStlist('', false);
  },

  showStlist(name, sfsx) {
    wx.showLoading({
      title: '正在加载中',
    })
    let that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/wxXcx/getStationListLb.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        longitude: that.data.longitude,
        latitude: that.data.latitude,
        name: name,
        limit: 99,// 99个站点
        dis: 100,// 100km
      },
      success: (re) => {
        that.setData({
          stList: re.data
        })

        wx.hideLoading();

        if (sfsx) {
          wx.stopPullDownRefresh();
        }
      }
    });
  },
  goDevDetail(e) {
    console.log(e.currentTarget.dataset.stid);
    wx.navigateTo({ url: '../../charge/charge?id=' + e.currentTarget.dataset.stid });
  },

  onPullDownRefresh() {
    this.showStlist('', true);
  },
});