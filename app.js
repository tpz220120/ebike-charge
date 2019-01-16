
App({
  codeid:'',
  httpUrl:'https://xcx.ebike-charge.com',//生产
  //httpUrl:'https://xcxbeta.ebike-charge.com',//测试
  globalData: {
    hasLogin: false,
    userPhone:'',
    apiW:0,
    apiH:0,
    sessionid:null,
    expiredTime: 0,
  },
  onLaunch:function(options) {    
    wx.getSystemInfo({
      success: (res) => {
        this.globalData.apiW = res.windowWidth;
        this.globalData.apiH = res.windowHeight - 40;
      }
    })

    // //静默授权获取用户的userid
    // wx.login({
    //   success: res => {
    //     console.info('onLaunch静默授权code==' + res.code);
    //     if (res.code) {
    //       // 认证成功
    //       // 调用自己的服务端接口，让服务端进行后端的授权认证，并且种session，需要解决跨域问题
    //       wx.request({
    //           url: this.httpUrl + '/ebike-charge/wxXcx/getXcxMsg.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
    //         data: {
    //           code: res.code
    //         },
    //         success: (re) => {
    //           // 授权成功并且服务器端登录成功
    //           this.globalData.sessionid = re.data.sessionid; 
    //           this.globalData.expiredTime = +new Date();   
    //           this.globalData.hasLogin = true; 
    //           this.globalData.userPhone = re.data.phone;
    //           // 如果没绑定手机，则跳转到绑定手机页面
    //           console.log(re.data.phone);
    //           if (re.data.phone == ''){
    //              // 绑定后跳转到首页
    //             wx.navigateTo({ url: 'pages/user/bindphone/bindphone?phone=&url=main'});
    //           }
    //           console.log(this.globalData); 
    //         },
    //       });
    //     }
    //   },
    // });
  },

  getSessionId() {
    return new Promise((resolve, reject) => {
      var sessionId = this.globalData.sessionId;
      var expiredTime = this.globalData.expiredTime;
      var now = +new Date();
      // session不为空并且不过期
      if (this.globalData.sessionid != null && ((now - expiredTime) <= 1 * 24 * 60 * 60 * 1000)) {
        this.globalData.sessionId = sessionId;
        this.globalData.expiredTime = expiredTime;
        console.log(this.globalData.sessionid);
        resolve(this.globalData.sessionid);
      } else {
        console.log(this);
        var that = this;
          wx.login({
            success: function (res) {
              if (res.code) {
                //TODO
                console.log('获取用户登录态成功！');
                wx.request({
                  url: that.httpUrl + '/ebike-charge/wxXcx/getXcxMsg.x',
                  data: {
                    code: res.code
                  },
                  success: function (xcxre) {
                    // 授权成功并且服务器端登录成功
                    that.globalData.sessionid = xcxre.data.sessionid;
                    that.globalData.expiredTime = +new Date();
                    console.log(that.globalData); 
                    that.globalData.hasLogin = true;
                    that.globalData.userPhone = xcxre.data.phone;
                    resolve(xcxre.data.sessionid);
                  }
                })
              } else {
                console.log('获取用户登录态失败！' + res.errMsg)
              }
            }
          });

          //this.getLogin();
         }      
       });
  },
});
