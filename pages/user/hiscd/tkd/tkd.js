var app = getApp();

Page({
  data: {
    info:[],
    dcount:'',
    dinfo:[],
    imgcount:0,
  },
  onLoad(option) {
    wx.showLoading();
    wx.request({
        url: app.httpUrl + '/ebike-charge/workOrder/initSqtkGd.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          type: option.type,
          id: option.id
        },
        success: (re) => {
          // 授权成功并且服务器端登录成功
          wx.hideLoading();
          this.setData({
            info: re.data.info,
            dinfo:re.data.dinfo,
            dcount:re.data.dcount,
            imgcount:re.data.imgcount,
          });       
        },
        fail: () => {
          wx.hideLoading();
        },
      });
  },
  previewImage(e){
    console.log(e);
    // wx.previewImage({
    //   current: 1,
    //   urls: [
    //     e.currentTarget.dataset.imsrc,
    //   ],
    // });

    wx.downloadFile({
      url: e.currentTarget.dataset.imsrc,
      success({ apFilePath }) {
        console.log(apFilePath);
        wx.previewImage({
          urls: [apFilePath],
        });
      },
      fail(res) {
        wx.showModal({
          content: res.errorMessage || res.error,
          showCancel: false
        });
      },
    });
  },
});
