var app = getApp();

Page({
  data: {
    month: '',
    startDate: '',
    endDate: '',
    wdqjl: '',
    num_zs: '0',
    num_xs: '0',
    cdList: [],
  },
  onLoad() {

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

    this.getCdList(current);
  },

  getM(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({
      month: e.detail.value
    })

    wx.request({
      url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/getHisHb.x', 
      data: {
        sessionid: app.globalData.sessionid,
        month: e.detail.value
      },
      success: (re) => {
        console.log(re);
        // 授权成功并且服务器端登录成功
        this.setData({
          wdqjl: re.data.wdqjl,
          accountList: re.data.accountList,
        });
      },
      fail: () => {
      },
    });
  },

  getCdList: function (month) {
    wx.request({
      url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/initHb.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        sessionid: app.globalData.sessionid,
        month: month
      },
      success: (re) => {
        console.log(re);
        // 授权成功并且服务器端登录成功
        this.setData({
          wdqjl: re.data.wdqjl,
          accountList: re.data.accountList,
          num_zs: re.data.account_num,
          num_xs: re.data.account_num_xs,
        });
      },
      fail: () => {
      },
    });
  },
});
