var app = getApp();
Page({
  data: {
    tempFilePath: '',
    filec:0,
    textareav:'',
    userid:'',
    textsm:'',
    recordid:'',//如果是退款申请的话，还需要保存充电记录id
  },
  onLoad(option) {
    console.log(option.userid);
    var textsm='';
    if(option.type == 'sqtk'){
      textsm='退款申请说明：';
      this.setData({
        userid:option.userid,
        recordid:option.id,
        textsm:textsm
      })
    }else{
      textsm='投诉或者建议内容：';
      this.setData({
        userid:option.userid,
        textsm:textsm
      })
    }
    
  },
  chooseImage() {
    wx.chooseImage({
      count: 1,
      success: res => {
        console.log('chooseImage', res);
        this.setData({
          tempFilePath: res.tempFilePaths[0],
        });
      },
    });
  },

  previewImage(e){
    console.log(e);
    wx.previewImage({
      current: 1,
      urls: [
        e.currentTarget.dataset.imsrc,
      ],
    });
  },

  bindTextAreaBlur: function(e) {
    this.setData({
      textareav:e.detail.value
    })
  },

  saveFile() {
    const textareav = this.data.textareav;
    const userid = this.data.userid;
    const recordid = this.data.recordid;
    var sm='';
    var url,baseparam;
    if(recordid != ''){
      sm = '退款申请';
      url = app.httpUrl + '/ebike-charge/workOrder/goSqtk.x';
      baseparam = {
        recordid:recordid,
        userid: userid,
        sm:encodeURI(textareav)
      }
    }else{
      sm = '投诉/建议';
      url = app.httpUrl + '/ebike-charge/workOrder/goTsjy.x';
      baseparam = {
        userid: userid,
        sm:encodeURI(textareav)
      }
    }

    console.log(textareav);
    if(textareav==''){
      wx.showModal({
        content: sm + '说明内容不能为空！',
        showCancel: false
      });

      return;
    }else if(textareav.length < 10){
      wx.showModal({
        content: sm + '说明内容不能少于10个字！',
        showCancel: false
      });

      return;
    }

    if(this.data.tempFilePath != ''){
      baseparam.hfile = '1';
      console.log(baseparam);
        wx.uploadFile({
          url: url,
          headers: { 
            'Content-Type': 'multipart/form-data'
          },
          name:'image',
          filePath: this.data.tempFilePath,
          formData: baseparam,
          success: (re) => {
            var dd = JSON.parse(re.data);
            console.log(dd.status);
            if(dd.status == '1'){
              wx.showModal({
                content: '您的' + sm + '提交成功，请耐心等待反馈！',
                showCancel: false,
                success: function (res) {
                  if (res.confirm) {
                    wx.navigateBack({
                      delta: 1
                    });
                  }
                }
              }); 
            }else{
              wx.showModal({
                content: '保存失败，请联系管理员！',
                showCancel: false
              }); 
            }
          },
          fail: function(res) {
            wx.showModal({
              content: '上传失败！',
              showCancel: false
            });
          }
        });
    }else{
      baseparam.hfile = '0';
      console.log(baseparam);
      // //保存到投诉建议表
      wx.request({
        url: url, 
        data: baseparam,
        method:'POST',
        header: { 'content-type': 'application/x-www-form-urlencoded' },
        success: (re) => {
          // 保存成功跳转到建议页面
          if(re.data.status == '1'){
            wx.showModal({
              content: '您的' + sm + '提交成功，请耐心等待反馈！',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  });
                }
              }
            });  
          }else{
            wx.showModal({
              content: '保存失败，请联系管理员！',
              showCancel: false
            }); 
          }
        },
        fail: () => {
        },
      });
    }
  },
  clear() {
    this.setData({
      tempFilePath: '',
    });
  },

  goTsjy(){
    console.log(22);
    wx.navigateBack({
      delta: 1
    });
  }
});
