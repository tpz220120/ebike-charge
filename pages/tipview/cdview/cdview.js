Page({
  data: {
      title: '',
      resultView:'',
      button: '返回首页',
      onButtonTap: 'handleBack',
  },
  handleBack(e) {
    const { dataset } = e.currentTarget;
    wx.showToast({
      content: '1秒后返回首页',
      success: res => {
        setTimeout(() => {
            // wx.navigateBack({
            //   delta:1
            //});
            wx.redirectTo({ url: '../../main/main'});
         //wx.redirectTo({ url: dataset.href });
        }, 500);
      },
    });
  },
  onLoad(option) {
      // 根据页面传过来的参数自定义显示内容
      var st = option.status;
      console.log(st);
      if(st == 'null'){
          this.setData({
              title:'温馨提醒',
              resultView:'该充电插座二维码无效！',
          })
      }else if(st == '9'){
          this.setData({
              title:'温馨提醒',
              resultView:'该充电插座不可用（设备离线），请更换一个插座充电。给您带来不便，敬请谅解，谢谢！',
          })
      }else if(st == '8'){
          this.setData({
              title:'温馨提醒',
              resultView:'该充电插座正在检修中，请更换一个插座充电。给您带来不便，敬请谅解，谢谢！',
          })
      }else if(st == '1' || st == '2'){
          this.setData({
              title:'温馨提醒',
              resultView:'该充电插座正在使用中（已被预订），请更换一个插座充电。给您带来不便，敬请谅解，谢谢！',
          })
      }else if(st == 'wx'){
          this.setData({
              title:'温馨提醒',
              resultView:'该二维码无效！',
          })
      }
  }
  ,
});
