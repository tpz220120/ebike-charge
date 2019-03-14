var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
      hasCard: 0,
      cardList:[],
      userid: '',
      phone: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    if (app.globalData.sessionid != null) {
      wx.request({
        url: app.httpUrl + '/ebike-charge/card/initCardMain.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          sessionid: app.globalData.sessionid
        },
        success: (re) => {
          // 授权成功并且服务器端登录成功
          console.log(re);

          this.setData({
            userid: re.data.userid,
            phone: re.data.phone
          });

          if (re.data.hasCard == '1') {
            this.setData({
              hasCard: 1,
              cardList:re.data.cardList
            });
          } else {
            this.setData({
              hasCard: 0
            });
          }
        },
        fail: () => {
        },
      });
    }
  },

  gocz(e){
    console.log(e.currentTarget.dataset.cardid);
    wx.navigateTo({
      url: 'cz/cz?type=1&cardid=' + e.currentTarget.dataset.cardid,
    })
  },

  godc(e) {
    wx.navigateTo({
      url: 'cz/cz_dc?userid=' + this.data.userid + '&phone=' + this.data.phone,
    })
  },

  gotocard(e) {
    console.log(e.currentTarget.dataset.cardid);
    wx.navigateTo({
      url: 'tocard/tocard?userid=' + this.data.userid + '&cardid=' + e.currentTarget.dataset.cardid + '&phone=' + this.data.phone,
    })
  },

  // 绑定卡
  gobindcard(e) {
    console.log(e);
    wx.navigateTo({
      url: 'card?userid=' + this.data.userid + '&phone=' + this.data.phone,
    })
  },

  // 解绑
  gounbindcard(e) {
    console.log(e.currentTarget.dataset.cardid);
    wx.navigateTo({
      url: 'unbind/unbind?userid=' + this.data.userid + '&phone=' + this.data.phone + '&cardid=' + e.currentTarget.dataset.cardid,
    })
  },
})