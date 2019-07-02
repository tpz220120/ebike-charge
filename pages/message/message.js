var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    count:0,
    info:[],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
     var that = this;
      wx.request({
        url: app.httpUrl + '/ebike-charge/logMsg/getLogList.x',
        data: {
          sessionid: app.globalData.sessionid
        },
        success: (re) => {
            that.setData({
              info:re.data.info,
              count:re.data.count
            })
        }
      });
  },

  goHis(){
    wx.navigateTo({
      url: '../user/hiscd/hiscd',
    })
  }
})