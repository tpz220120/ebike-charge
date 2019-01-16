var app = getApp();

Page({
  data: {
    info:[],
    dcount:'',
    dinfo:[],
    tsjg:'',
    imgcount:0,
    hidden:true,
    animContentData: [],
    textareav:'',
    xh:'',
    id:'',
  },
  onLoad(option) {
    const animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'cubic-bezier(.55, 0, .55, .2)',
    });
    this.contentAnim = animation;
    animation.translateY(0).step();
    this.setData({
      animContentData: animation.export(),
    });
    wx.showLoading();
    wx.request({
        url: app.httpUrl + '/ebike-charge/workOrder/initTsjyGd.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          id: option.id,
          tsjg:option.tsjg
        },
        success: (re) => {
          // 授权成功并且服务器端登录成功
          wx.hideLoading();
          this.setData({
            info: re.data.info,
            dinfo:re.data.dinfo,
            dcount:re.data.dcount,
            tsjg:option.tsjg,
            imgcount:re.data.imgcount,
            xh:re.data.xh,
            id:option.id,
          });       
        },
        fail: () => {
          wx.hideLoading();
        },
      });
  },
  previewImage(e){
    console.log(e.currentTarget.dataset.imsrc);
    // wx.previewImage({
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

  rePage(e){
    var lx = e.currentTarget.dataset.lx;
    console.log(lx);
    if(lx == 'no'){
      this.setData({
        hidden:!this.data.hidden,
      })
      this.createContentShowAnim();
    }else{
      this.tsjygd('yes');
    }
  },

  qrfk(e){
    if(this.data.textareav == ''){
      wx.showModal({
        content: '请您输入反馈内容！',
        showCancel: false
      });
    }else{
      this.tsjygd('no');
    }
  },

  tsjygd:function(type){
    // 问题已解决--直接归档
    var param;
    console.log(this.data.id + "=" + this.data.xh + "=" + this.data.textareav);
    if(type == 'yes'){
      param = {
        id:this.data.id,
        type:type,
        xh:'',
        sm:''
      }
    }else{
      param = {
        id:this.data.id,
        type:type,
        xh:this.data.xh,
        sm:this.data.textareav
      }
    }
    wx.request({
        url: app.httpUrl + '/ebike-charge/workOrder/goTsjyGd.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: param,
        success: (re) => {
          var a;
          if(re.data.status == '1'){
            if(type == 'yes'){
                a = '谢谢您对我们的支持！'
            }else{
                a = '谢谢您的反馈！'
            }
          }else{
            a = '反馈失败，请联系管理员！'
          }
          
          wx.showModal({
            content: a,
            showCancel: false,
            success() {
              if (re.data.status == '1') {
                wx.navigateBack({
                  delta: 1
                });
              }
            }  
          });
        },
        fail: () => {
          wx.hideLoading();
        },
      });
  },

  bindTextAreaBlur: function(e) {
    this.setData({
      textareav:e.detail.value
    })
  },
  createContentHideAnim:function() {
    this.contentAnim.translateY('100%').step();
    this.setData({
      animContentData: this.contentAnim.export(),
    });
  },

  createContentShowAnim:function() {
    const animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'cubic-bezier(.55, 0, .55, .2)',
    });
    this.contentAnim = animation;
    animation.translateY(0).step();
    this.setData({
      animContentData: animation.export(),
    });
  },
  onModalCloseTap() {
    this.createContentHideAnim();
    setTimeout(() => {
      this.setData({
        hidden: true,
      });
    }, 210);
  },

});
