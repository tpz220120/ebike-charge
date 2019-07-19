var app = getApp();

Page({
  data: {
    cmpncount: '',
    cmpnList: [],
  },
  onLoad() {

  },

  onShow() {
    wx.request({
      url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/initCzhb.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      success: (re) => {
        console.log(re);
        // 授权成功并且服务器端登录成功
        this.setData({
          cmpncount: re.data.pcount,
          cmpnList: re.data.cmpnList,
        });
      },
      fail: () => {
      },
    });
  },

  goCzhb(e) {
    var type = e.currentTarget.dataset.type;

    if (type == 'RECHARGE'){
      wx.navigateTo({
        url: 'cmpndetail/cmpndetail?cmpn_id=' + e.currentTarget.dataset.cmpnid,
      })
    }else{
      wx.navigateTo({
        url: 'cmpnpackage/package?cmpn_id=' + e.currentTarget.dataset.cmpnid,
      })
    }

  },

  goSt(e) {
    console.log(e.currentTarget.dataset.cmpnid);

    wx.navigateTo({
      url: 'cmpnpackage/packageStation?cmpn_id=' + e.currentTarget.dataset.cmpnid,
    })

  },
});
