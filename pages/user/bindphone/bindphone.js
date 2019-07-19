var app = getApp();
Page({
  data: {
    phone:'',
    oldphone:'',
    yzm:'',
    second:60,
    timer:null,
    yzmtext:'获取验证码',
    sffsdx:false,//是否已发送短信，60秒内不能重复发送
    sfbdsj:false,// 是否点击绑定手机按钮，如点击，则不能再点
  },
  onLoad(option) {
    this.setData({
      oldphone:option.phone,
      tzurl: option.url
    })
  },

  bindKeyInputPhone(e){
    this.setData({
      phone: e.detail.value,
    });
  },

  bindKeyInputYzm(e){
      this.setData({
        yzm: e.detail.value,
      });
  },

  validation_phone:function(phone){
    var regu = /^[1][0-9][0-9]{9}$/;
    var re = new RegExp(regu);
    console.log(re.test(phone));
    if (re.test(phone)) {
      return true;
    } else {
      return false;
    }
  },
  
  smsButtonInterval:function(){
    var that=this;
    that.data.timer = setInterval(
      function () {
          that.setData({
              second:that.data.second - 1
          })

          if(that.data.second==0){
            that.setData({
              yzmtext:'获取验证码',
              sffsdx:false,
              second:60,
            })
            clearInterval(that.data.timer);//清除定时器
          }else{
            that.setData({
              yzmtext:that.data.second +"秒后可重发",
            })
          }
      }
    , 1000);   

    that.setData({
        yzmtext:that.data.second +"秒后可重发",
        sffsdx:true,
    })
  },

  onUnload: function () {
      //清除计时器 
      clearInterval(this.data.timer)
  },

  onHide: function () {
      //清除计时器
      clearInterval(this.data.timer)
  },
  getyzm(e){
    if(this.data.sffsdx){
      return;
    }
    const phone = this.data.phone;
    const oldphone = this.data.oldphone;
    if(phone.length===0){
      wx.showModal({
        content: '请输入手机号',
        showCancel: false
      });
		}else if(!this.validation_phone(phone)){
      wx.showModal({
        content: '手机格式不正确',
        showCancel: false
      });
    }else{
			var type = '1';// 绑定
			if(oldphone != '' && oldphone != 'null'){
				type = '2';// 重新绑定
			}
			
      wx.request({
          url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/smssend.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
          data: {
            phone:phone,
            type:type
          },
          success: (re) => {
            if(re.data.code == '0'){
              console.log(re);
              wx.showModal({
                content: re.data.msg,
                showCancel: false
              });

                this.smsButtonInterval();
            }else{
              wx.showModal({
                content: re.data.msg,
                showCancel: false
              });
            } 
            
          },
          fail: () => {
          },
      });
		}
  },

  bindPhone(){
		if(this.validateBindPhone()){
			this.bindPhone_submit();
		}
	},
	
	validateBindPhone:function(){
    const phone = this.data.phone;
    const yzm = this.data.yzm;
		if(phone.length==0){
      wx.showModal({
        content: '请输入手机号',
        showCancel: false
      });
			return false;
		}else if(!this.validation_phone(phone)){
      wx.showModal({
        content: '手机格式不正确',
        showCancel: false
      });
			return false;
		}else if(yzm.length==0){
      wx.showModal({
        content: '请输入手机验证码',
        showCancel: false
      });
			return false;
		}else if(yzm.length!=6){
      wx.showModal({
        content: '手机验证码为6位数字',
        showCancel: false
      });
			return false;
		}
		
		return true;
	},
	
  bindPhone_submit:function(){
    if(this.data.sfbdsj){
      return;
    }
		var param={
			phone:this.data.phone,
			smscode:this.data.yzm,
      sessionid:app.globalData.sessionid,
		}

    console.log(param);

    this.setData({
      sfbdsj:true,
    })
    wx.request({
        url: app.httpUrl + '/ebike-charge/wxxcxUserCenter/bindPhone.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: param,
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        method:'POST',
        success: (re) => {
          console.log(re);
          var that = this;
          if(re.data.code == '0'){
            wx.showModal({
              content:'绑定手机号码成功',
              showCancel: false,
              success(){
                that.setData({
                  sfbdsj:false
                })
                app.globalData.userPhone = that.data.phone;
                if (that.data.tzurl == 'center'){
                  wx.navigateBack({
                    delta: 1
                  });
                }else{
                  wx.redirectTo({ url: '../../main/main' });
                }
              }
            })
          }else if(re.data.code == '1'){
            wx.showModal({
              content:'短信验证码不正确',
              showCancel: false,
              success(){
                that.setData({
                  sfbdsj:false
                })
              }
            })
          }
        },
        fail: () => {
        },
    });
		
	},
});
