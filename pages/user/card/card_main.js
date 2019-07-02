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
    var that = this;
    app.getSessionId().then(function (sessionid) {
      that.getCard();
    })
  },

  getCard:function(){
    var that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/card/initCardMain.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        sessionid: app.globalData.sessionid
      },

      success: (re) => {
        // 授权成功并且服务器端登录成功
        console.log(re);

        that.setData({
          userid: re.data.userid,
          phone: re.data.phone
        });

        if (re.data.hasCard == '1') {
          that.setData({
            hasCard: 1,
            cardList: re.data.cardList
          });
        } else {
          that.setData({
            hasCard: 0
          });
        }
      },
      fail: () => {
      },
    });
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
    wx.navigateTo({
      url: 'unbind/unbind?userid=' + this.data.userid + '&phone=' + this.data.phone + '&cardid=' + e.currentTarget.dataset.cardid,
    })
  },

  // 挂失
  gomisscard(e) {
    var card_id = e.currentTarget.dataset.cardid;
    var status = e.currentTarget.dataset.status;

    var content = '确定挂失卡号为' + card_id + '的充电卡吗？';
    if (status == '1'){
      content = '确定为卡号' + card_id + '的充电卡解除挂失吗？';
    }
    var that = this;
    wx.showModal({
      title: '提示',
      content: content,
      success:function(res){
        if(res.confirm){
          wx.request({
            url: app.httpUrl + '/ebike-charge/card/updCard.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
            data: {
              card_id: card_id,
              userid: that.data.userid,
              phone: that.data.phone,
              status: status
            },
            success: (re) => {
              //刷新页面
              if(re.data.status == '1'){
                wx.showModal({
                  title: '提示',
                  content: '充电卡' + card_id + '操作成功！',
                  showCancel: false,
                  success: function (res) {
                    // 刷新列表
                    that.getCard();
                  }
                })
              }else{
                wx.showModal({
                  title: '提示',
                  content: '充电卡' + card_id + '操作失败，请联系管理员！',
                  showCancel:false
                })
              }
            },
            fail: () => {
            },
          });
        }
      }
    })
  },
})