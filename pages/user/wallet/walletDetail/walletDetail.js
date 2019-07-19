var app = getApp();
Page({
  data: {
    month: '',
    startDate: '',
    endDate: '',
    userid:'',
    cmpnid:'',
    wdqjl:'',
    reList: [],
    info:{}
  },
  onLoad(options) {
    console.log(options);
    this.setData({
      userid: options.userid,
      cmpnid: options.cmpnid,
    })

    var that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/cmpn/initPackFlow.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        userid: that.data.userid,
        cmpnid: that.data.cmpnid
      },
      success: (re) => {
        // 授权成功并且服务器端登录成功
        that.setData({
          info: re.data.info
        });
      },
      fail: () => {
      },
    });
  },

  onShow() {
    var t = new Date();
    var year = t.getFullYear();
    var month = t.getMonth() + 1;
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    var current = year + "-" + month;
    var start = (year - 1) + "-01-01";
    var end = current + "-01";
    this.setData({
      month: current,
      startDate: start,
      endDate: end,
    });

    this.getPkgList();
  },

  getPkgList(){
    var that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/cmpn/getPackageFlow.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        month: that.data.month,
        userid: that.data.userid,
        cmpnid: that.data.cmpnid
      },
      success: (re) => {
        // 授权成功并且服务器端登录成功
        that.setData({
          wdqjl: re.data.wdqjl,
          reList: re.data.reList,
        });
      },
      fail: () => {
      },
    });
  },

  getM(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      month: e.detail.value
    })

    this.getPkgList();
  }
})