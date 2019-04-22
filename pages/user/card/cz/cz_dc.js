var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cardid: '',
    userid: '',
    phone: '',
    a:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      userid: options.userid,
      phone: options.phone
    })
  },

  bindKeyInput(e) {
    this.setData({
      cardid: e.detail.value,
    });
  },

  checkNo(e) {
    console.log(this.data);
    wx.request({
      url: app.httpUrl + '/ebike-charge/card/getCardInfo.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        card_id: this.data.cardid
      },
      success: (re) => {
        // 授权成功并且服务器端登录成功
        console.log(re);
        if(re.data.status == '0'){
            wx.showModal({
              content: '无法核查到卡的信息！',
              showCancel:false
            })
        } else if (re.data.info.charge_user_no == this.data.userid) {
          wx.showModal({
            content: '请不要核查自己的充电卡！',
            showCancel: false
          })
        } else if (re.data.info.status == '0' || re.data.info.status == '2' ) {
          wx.showModal({
            content: '该卡尚未绑定，请绑定后再充值！',
            showCancel: false
          })
        }else{
          this.setData({
            a: '1',
            info: re.data.info
          })
        }
      },
      fail: () => {
      },
    });
  },

  goCz(){
    if(this.data.a == ''){
      wx.showModal({
        content: '请先核查卡的信息！',
        showCancel: false
      })
    } else if (this.data.cardid != this.data.info.card_id){
      wx.showModal({
        content: '输入卡的标识和核查的卡标识不一致，请校验！',
        showCancel: false
      })
    }else {
      wx.navigateTo({
        url: 'cz?type=2&cardid=' + this.data.cardid + '&userid=' + this.data.userid + '&phone=' + this.data.phone,
      })
    } 
  }
})