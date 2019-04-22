var app = getApp();

Page({
  data: {
    user:'',
    account_num:'0',
    dqcd_num:'0',
    hb_num:'0',
    bindPhone:'',
    sfbd:'',
    sfxsbd:'1',
  },
  onLoad() {
    //this.getUserInfo();
    if (app.globalData.userPhone == '') {
      // 绑定后跳转到首页
      wx.navigateTo({ url: '../user/bindphone/bindphone?phone=&url=main' });
    }
  },

  onShow() {
    var that=this;
    app.getSessionId().then(function (sessionid) {
        wx.request({
        url: app.httpUrl + '/ebike-charge/wxXcx/initUser.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          sessionid: app.globalData.sessionid
        },
        success: (re) => {
          // 授权成功并且服务器端登录成功
          console.log(re);
          that.setData({
            account_num: re.data.account_num,
            dqcd_num:re.data.dqcd_num,
            bindPhone:re.data.bindPhone,
            sfbd:re.data.sfbd,
            hb_num: re.data.hbaccount_num
          });
        },
        fail: () => {
        },
      });
    })
  },
  handleListItemTap(e) {
    var i = e.currentTarget.dataset.index;
    console.log(i);
    if(i ==2){
      wx.navigateTo({ url: 'user-cdjl/user-cdjl' });
    }else if(i ==0){
      wx.navigateTo({ url: 'cz/cz' });
    }else if(i ==1){
      wx.navigateTo({ url: 'xfjl/xfjl' });
    }else if(i ==3){
      wx.navigateTo({ url: 'hiscd/hiscd' });
    }else if(i ==4){
      wx.navigateTo({ url: 'about/about' });
    }else if(i ==5){
      wx.navigateTo({ url: '../tsjy/tsjy' });
    }else if (i == 6) {
      wx.navigateTo({ url: 'cmpn/cmpnList' });
    }else if (i == 7) {
      wx.navigateTo({ url: 'redpkt/redpkt' });
    } else if (i == 8) {//充电卡
      wx.navigateTo({ url: 'card/card_main' });
    }else{
      wx.showModal({
        content: '此功能暂未开放！',
        showCancel: false
      });
    }
  },

  bindPhone(e) {
    console.log(this.data.bindPhone);
    wx.navigateTo({ url: 'bindphone/bindphone?url=center&phone=' + this.data.bindPhone});
  },
});
