var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cardid: '',
    userid: '',
    phone: '',
    yzm: '',
    second: 60,
    timer: null,
    yzmtext: '获取验证码',
    sffsdx: false,//是否已发送短信，60秒内不能重复发送
    sfbdsj: false,// 是否点击解绑按钮，如点击，则不能再点
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
    this.setData({
      cardid: options.cardid,
      userid: options.userid,
      phone: options.phone
    })
  },

  bindKeyInputYzm(e) {
    this.setData({
      yzm: e.detail.value,
    });
  },

  smsButtonInterval: function () {
    var that = this;
    that.data.timer = setInterval(
      function () {
        that.setData({
          second: that.data.second - 1
        })

        if (that.data.second == 0) {
          that.setData({
            yzmtext: '获取验证码',
            sffsdx: false,
            second: 60,
          })
          clearInterval(that.data.timer);//清除定时器
        } else {
          that.setData({
            yzmtext: that.data.second + "秒后可重发",
          })
        }
      }
      , 1000);

    that.setData({
      yzmtext: that.data.second + "秒后可重发",
      sffsdx: true,
    })
  },

  getyzm(e) {
    if (this.data.sffsdx) {
      return;
    }
    const phone = this.data.phone;
    wx.request({
      url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/smssend.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        phone: phone,
        type: '4'//解绑充电卡
      },
      success: (re) => {
        if (re.data.code == '0') {
          console.log(re);
          wx.showModal({
            content: re.data.msg,
            showCancel: false
          });

          this.smsButtonInterval();
        } else {
          wx.showModal({
            content: re.data.msg,
            showCancel: false
          });
        }

      },
      fail: () => {
      },
    });
    
  },

  unbindCard() {
    var that = this;
    if (this.validate()) {
      wx.showModal({
        title: '温馨提示',
        content: '确定解绑卡：' + this.data.cardid,
        success(res) {
          if (res.confirm) {
            that.unbind_submit();
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  validate: function () {
    const yzm = this.data.yzm;
    if (yzm.length == 0) {
      wx.showModal({
        content: '请输入手机验证码',
        showCancel: false
      });
      return false;
    } else if (yzm.length != 6) {
      wx.showModal({
        content: '手机验证码为6位数字',
        showCancel: false
      });
      return false;
    }

    return true;
  },

  unbind_submit: function () {
    if (this.data.sfbdsj) {
      return;
    }
    var param = {
      card_id: this.data.cardid,
      user_id: this.data.userid,
      phone: this.data.phone,
      smscode: this.data.yzm,
    }

    // 防止重复点击解绑按钮
    this.setData({
      sfbdsj: true,
    })
    wx.request({
      url: app.httpUrl + '/ebike-charge/card/unbindCard.x', 
      data: param,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      success: (re) => {
        console.log(re);
        var that = this;
        if (re.data.status == '1') {
          wx.showModal({
            title:'卡号：' + this.data.cardid,
            content: '解绑成功！',
            showCancel: false,
            success() {
              that.setData({
                sfbdsj: false
              })
              wx.navigateBack({
                delta: 1
              });              
            }
          })
        } else if (re.data.status == '0') {
          wx.showModal({
            content: '短信验证码不正确',
            showCancel: false,
            success() {
              that.setData({
                sfbdsj: false
              })
            }
          })
        }
      },
      fail: () => {
      },
    });
  },
})