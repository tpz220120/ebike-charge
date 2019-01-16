var app = getApp();

Page({
  data: {
    wdqjl:'',
    dqcdList:[],
  },
  onLoad() {},
  onShow(){
      wx.request({
        url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/getDqCdList.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          sessionid: app.globalData.sessionid,
        },
        success: (re) => {
          console.log(re);
          // 授权成功并且服务器端登录成功
          this.setData({
            wdqjl: re.data.wdqjl,
            dqcdList:re.data.dqcdList,
          });        
        },
        fail: () => {
        },
      });
  },

  gocdxx(e){
     const id = e.currentTarget.dataset.id;
     wx.navigateTo({
       url:'../../cdxx/cdxx?type=user-cdxx&id='+ id
     });
  },
});
