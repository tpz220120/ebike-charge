var app = getApp();

Page({
  data: {
    info: {},
    cmpn_id:''
  },
  onLoad(option) {
    this.setData({
      cmpn_id: option.cmpn_id,
    });

    wx.request({
      url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/initCzhbDetail.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data:{
        cmpn_id: option.cmpn_id,
        sessionid: app.globalData.sessionid
      },
      success: (re) => {
        console.log(re);
        // 授权成功并且服务器端登录成功
        this.setData({
          info: re.data.info,
        });
      },
      fail: () => {
      },
    });
  },

  goCzhb() {
    if (this.data.info.kcycs == '0') {
      wx.showModal({
        title: '亲',
        content: '参与次数已到达上限！',
        showCancel: false
      });
      return;
    }

    var cmpn_id = this.data.cmpn_id;
    var that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/wxpay/goWechatCzHb.x',
      data: {
        sessionid: app.globalData.sessionid,
        czje: this.data.info.recharge_money,
        cmpnid: cmpn_id
      },
      success: (re) => {
        // 跳转到充电信息页面
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
                content: '您已成功参与“充值' + this.data.info.recharge_money + '元赠送' + this.data.info.presend_redpkt_money +'元红包”的活动，请至我的余额、我的红包查看。',
                showCancel: false,
                success(res){
                  wx.request({
                    url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/initCzhbDetail.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
                    data: {
                      cmpn_id: cmpn_id,
                      sessionid: app.globalData.sessionid
                    },
                    success: (re) => {
                      console.log(re);
                      // 授权成功并且服务器端登录成功
                      that.setData({
                        info: re.data.info,
                      });
                    },
                    fail: () => {
                    },
                  });
                }
              });
            },
            fail: (res) => {
              console.log(res.errMsg);
              if (res.errMsg == 'requestPayment:fail cancel'){
                if (re.data.cyid != '0') {
                  wx.request({
                    url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/delCmpnUser.x',
                    method:'POST',
                    header: {
                      'content-type': 'application/x-www-form-urlencoded'
                    },
                    data: {
                      cyid: re.data.cyid
                    }
                  });
                }
              }else{
                wx.showModal({
                  content: '微信支付失败',
                  showCancel: false,
                  success(aa) {
                    //取消情况下删除红包赠送记录
                    if (re.data.cyid != '0') {
                      wx.request({
                        url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/delCmpnUser.x',
                        method: 'POST',
                        header: {
                          'content-type': 'application/x-www-form-urlencoded' 
                        },
                        data: {
                          cyid: re.data.cyid
                        }
                      });
                    }
                  }
                });
              }
            }
          });
        } else if (re.data.status == '10' || re.data.status == '20') {
          wx.showModal({
            title: '充值红包失败',
            content: re.data.msg,
            showCancel: false
          });
        }
      },
      fail: () => {
      },
    });
  },
});
