var app =getApp();

Page({
  data: {
    num_zs:'',
    num_xs:'',
    check:0,//金额框选中标志
    zfje:'',//支付金额显示
    cmpnList:[],
    cmpncount:0
  },
  onLoad() {
      // 此id为充电插座编号
    if (app.globalData.sessionid == null || app.globalData.sessionid == ''){
          var that = this;
          app.getSessionId().then(function(sessionid){
              that.getAccount(sessionid);
          });
      }else{
          this.getAccount(app.globalData.sessionid);
      }
  },

  getAccount:function(sessionid){
    wx.request({
        url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/getAccount.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          sessionid:sessionid,
        },
        success: (re) => {
          if(re.data != null){
              console.log(re.data);
              
              var zs = re.data.account_num;
              var xs = '';
              if(re.data.account_xs == '1'){
                  xs = '.' +  re.data.account_num_xs;
              }

              this.setData({
                  num_zs:zs,
                  num_xs:xs,
                  cmpnList: re.data.cmpnList,
                  cmpncount: re.data.cmpncount,
              });
          }
        },
        fail: () => {
        },
    });
  },

  innum(e){
    var v = e.currentTarget.dataset.v;
    this.setData({
      check:v,
      zfje:v,
    })
  },

  ljcz(e){
    // 金额不对
    if(parseFloat(this.data.zfje) <=0 || parseFloat(this.data.zfje) >=9999){
        wx.showModal({
          title: '亲',
          content: '请输入正确的支付金额！',
          showCancel: false
        });
        return;
    }

    wx.request({
      url: app.httpUrl + '/ebike-charge/wxpay/goWxPayCz.x', 
      data: {
        sessionid:app.globalData.sessionid,
        czje:this.data.zfje
      },
      success: (re) => {
        // 跳转到充电信息页面
        if(re.data.status == '0'){
          var ddid = re.data.ddid;
          wx.requestPayment({
            timeStamp: re.data.payDto.timeStamp,
            nonceStr: re.data.payDto.nonceStr,
            package: re.data.payDto.package_str,
            signType: re.data.payDto.signType,
            paySign: re.data.payDto.paySign,
            success: (res) => {
              this.getAccount(app.globalData.sessionid);                     
              //其他情况不跳转页面，留在本页面不动
            },
            fail: (res) => {

            }
          });
        }else if(re.data.status == '10'|| re.data.status == '20'){
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

  bindKeyInput(e){
    this.setData({
      zfje: e.detail.value,
    });
  },
});
