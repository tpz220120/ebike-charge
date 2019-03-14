var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cardid:'',
    userid: '',
    phone: ''
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

  bindKeyInputPhone(e) {
    this.setData({
      cardid: e.detail.value,
    });
  },

  bindCard(e){
    console.log(this.data.cardid);
    wx.request({
      url: app.httpUrl + '/ebike-charge/card/bindCard.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        card_id: this.data.cardid,
        user_id: this.data.userid,
        phone: this.data.phone
      },
      success: (re) => {
        // 授权成功并且服务器端登录成功
        console.log(re);
        
        if(re.data.status == '0'){
          wx.showModal({
            title: '绑定失败',
            content: '请核对标识码！',
            showCancel:false
          })
        } else if (re.data.status == '1') {
          wx.showModal({
            title: '绑定失败',
            content: '该卡已被其他账号绑定！',
            showCancel: false
          })
        } else{
          wx.showModal({
            content: '绑定成功！',
            showCancel: false,
            success: (r) =>{
              wx.navigateBack({
                delta: 1
              })
            }
          })
        }
      },
      fail: () => {
      },
    });
  }
})