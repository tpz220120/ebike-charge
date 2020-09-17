var app = getApp();
Component({
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  /**
   * 组件的属性列表
   */
  properties: {
    // 弹窗标题
    title: {
      type: String,
      value: '标题' // 默认值
    },
    // 弹窗内容
    content: {
      type: String,
      value: '弹窗内容'
    },

    // 弹窗确认按钮文字
    confirmText: {
      type: String,
      value: '确定'
    }
  },

  /**
   * 组件内私有数据
   */
  data: {
    // 弹窗显示控制
    isShow: false
  },

  /**
   * 组件的公有方法列表
   */
  methods: {
    //隐藏弹框
    hideDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    //展示弹框
    showDialog() {
      this.setData({
        isShow: !this.data.isShow
      })
    },
    /**
    * triggerEvent 组件之间通信
    */
    confirmEvent() {
      this.triggerEvent("confirmEvent");
    },

    getUserInfo(e) {
      var that = this;
      if(e.detail.userInfo){
        app.getSessionId().then(function (sessionid) {
          var info = e.detail.userInfo;
          var param={
            region:info.country + "@" + info.province + "@" + info.city,
            sessionid:sessionid,
            sex:info.gender,
            name:info.nickName
          }
          wx.request({
            url: app.httpUrl + '/ebike-charge/userInfo/saveUserInfoWechat.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
            data: param,
            header: {
              'content-type': 'application/x-www-form-urlencoded'
            },
            method:'POST',
            success: (re) => {
              app.globalData.userRegion = param.userRegion;
              that.triggerEvent("goNext");
            }
          })
        });
      }else{
        that.triggerEvent("goNext");
      }
    }
  }
})