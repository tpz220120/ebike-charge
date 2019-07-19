var app =getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cmpnid:'',
    stList:[],
    info:{}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options);
      this.setData({
        cmpnid: options.cmpn_id
      })

      //获取套餐活动的信息
    let that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/cmpn/initPackage.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        cmpnid: that.data.cmpnid,
        sessionid:app.globalData.sessionid
      },
      success: (re) => {
        that.setData({
          stList: re.data.reList,
          info:re.data.info
        })
      }
    });
  },

  goBuy() {
    var cmpnid = this.data.cmpnid;
    var that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/wxpay/goWechatPackage.x',
      data: {
        zfje: this.data.info.package_price,
        cmpnid: cmpnid,
        sessionid: app.globalData.sessionid,
        orgno: this.data.info.orgno
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
              var desc;
              if (that.data.info.package_type == '1'){
                desc = '月';
              } else if (that.data.info.package_type == '2'){
                desc = '季';
              }else{
                desc = '年';
              }
              wx.showModal({
                content: '您已购买' + desc + "卡，有效期至" + re.data.endDate,
                showCancel: false,
                success(res) {
                  // 跳转回活动页面
                  wx.navigateTo({
                    url: '../cmpnList',
                  })
                }
              });
            },
            fail: (res) => {
              console.log(res.errMsg);
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

})