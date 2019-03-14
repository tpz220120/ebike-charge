var app = getApp();

Page({
  data: {
    cardid:'',
    type:'',// 1为自身充值，2位代充值
    userid:'',//代充值的时候用
    phone: '',//代充值的时候用
    num_zs: '',
    num_xs: '',
    check: 0,//金额框选中标志
    zfje: ''//支付金额显示
  },
  onLoad(options) {
    this.setData({
      cardid: options.cardid,
      type: options.type,
    })

    if (options.type=='2'){
      this.setData({
        userid: options.userid,//代充值的时候用
        phone: options.phone,//代充值的时候用
      })
    }

    this.getAccount(options.cardid);
  },

  getAccount: function (card_id) {
    wx.request({
      url: app.httpUrl + '/ebike-charge/card/getAccount.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        card_id: card_id,
      },
      success: (re) => {
        if (re.data != null) {
          console.log(re.data);

          var zs = re.data.account_num;
          var xs = '';
          if (re.data.account_xs == '1') {
            xs = '.' + re.data.account_num_xs;
          }
          this.setData({
            num_zs: zs,
            num_xs: xs
          });
        }
      },
      fail: () => {
      },
    });
  },

  innum(e) {
    var v = e.currentTarget.dataset.v;
    this.setData({
      check: v,
      zfje: v,
    })
  },

  ljcz(e) {
    // 金额不对
    if (parseFloat(this.data.zfje) <= 0 || parseFloat(this.data.zfje) >= 9999) {
      wx.showModal({
        title: '亲',
        content: '请输入正确的支付金额！',
        showCancel: false
      });
      return;
    }

var that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/wxpay/goWxPayCardCz.x',
      data: {
        card_id: this.data.cardid,
        user_id: this.data.userid,
        phone:this.data.phone,
        type: this.data.type,
        czje: this.data.zfje,
        sessionid:app.globalData.sessionid
      },
      success: (re) => {
        // 跳转到充电信息页面
        console.log(re);
        if (re.data.status == '0') {
          var ddid = re.data.ddid;
          wx.requestPayment({
            timeStamp: re.data.payDto.timeStamp,
            nonceStr: re.data.payDto.nonceStr,
            package: re.data.payDto.package_str,
            signType: re.data.payDto.signType,
            paySign: re.data.payDto.paySign,
            success: (res) => {
              wx.showModal({
                title: '充值成功',
                showCancel: false,
                success:(r)=>{
                  //代充页面回退2
                  if (that.data.type == '2'){
                      wx.navigateBack({
                        detla:2
                      })
                  }else{
                    wx.navigateBack({
                      detla: 1
                    })
                  }
                }
              });
            },
            fail: (res) => {
            }
          });
        } else if (re.data.status == '10' || re.data.status == '20') {
          wx.showModal({
            title: '充值失败',
            content: re.data.msg,
            showCancel: false
          });
        }
      },
      fail: () => {
      },
    });
  },

  bindKeyInput(e) {
    this.setData({
      zfje: e.detail.value,
    });
  },
});
