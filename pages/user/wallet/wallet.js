var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    account_num: '0.0',
    hbaccount:0,
    hbaccount_num: '0.0',
    package:1,
    pkgList:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/initMyWallet.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        sessionid: app.globalData.sessionid
      },
      success: (re) => {
        // 授权成功并且服务器端登录成功
        console.log(re.data);
        that.setData({
          account_num: re.data.account_num,
          hbaccount: re.data.hbaccount,
          package: re.data.package
        });

        if (re.data.hbaccount == 1){
          that.setData({
            hbaccount_num: re.data.hbaccount_num
          });
        }  

        if (re.data.package == 1) {
          that.setData({
            pkgList: re.data.pkgList
          });
        }

        console.log(that.data) ;
      },
      fail: () => {
      },
    })
  },

  goPage(e) {
    var type = e.currentTarget.dataset.type;
    console.log(type);
    if (type == 'account') {
      wx.navigateTo({
        url: '../xfjl/xfjl',
      })
    } else if (type == 'redpkt') {
      wx.navigateTo({
        url: '../redpkt/redpkt',
      })
    } else if (type == 'package') {
      var cmpnid = e.currentTarget.dataset.cmpnid;
      var userid = e.currentTarget.dataset.userid;
      wx.navigateTo({
        url: 'walletDetail/walletDetail?cmpnid=' + cmpnid + '&userid=' + userid,
      })
    } else if (type == 'cz') {
      wx.navigateTo({
        url: '../cz/cz',
      })
    }
  },
})