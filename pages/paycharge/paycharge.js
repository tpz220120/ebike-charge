var app =getApp();

Page({
  data: {
    glbz1:'',
    glbz2:'',
    glbz3:'',
    glbz4:'',
    check:0,//金额框选中标志
    zfje:'',//支付金额显示
    flag:0,//计费模版弹出窗口显示余额支付还是支付宝支付的标志，1为弹出，0为关闭
    sfmzf:'2',//是否免是否 1为免支付，0为计费支付，2为默认初始值
    pluginfo:{},
    stationinfo:{},
    account:0,//账户余额
    hbaccount: 0,//红包余额
    radiov:'1',
    yechecked:false,
    hbchecked: false,
    alichecked:true,
    mincharge:0,
    yebzzf:'',
    hbbzzf: '',
    cmpn_id:'',
    showModalStatus:false,
    showPackage:false
  },
  onLoad(option) {
    console.log('option.id ==' + option.id);
    console.log('sessionid ==' + app.globalData.sessionid);
    console.log('app.codeid ==' + app.codeid);
    var id;
    // 如果是外面扫码那么判断是否有全局变量的扫码id在
    if(app.codeid != ''){
      id = app.codeid;
      app.codeid = '';
    }else{
      id = option.id;
    }

    // 此id为充电插座编号
    if (app.globalData.sessionid == null || app.globalData.sessionid == ''){
        var that = this;
        app.getSessionId().then(function(sessionid){
            if (app.globalData.userPhone == '') {
              // 绑定后跳转到首页
              wx.navigateTo({ url: '../user/bindphone/bindphone?phone=&url=main' });
            }else{
              that.showPlugMsg(id, sessionid);
            }
        });
    }else{
        if (app.globalData.userPhone == '') {
          // 绑定后跳转到首页
          wx.navigateTo({ url: '../user/bindphone/bindphone?phone=&url=main' });
        }else{
          this.showPlugMsg(id, app.globalData.sessionid);
        } 
    } 
  },

  innum(e){
    var v = e.currentTarget.dataset.v;
    this.setData({
      check:v,
      zfje:v,
    })
  },

  //按次确认支付
  aczf(e) {
    var v = e.currentTarget.dataset.v;
    this.setData({
      zfje: v
    })
    // 如果账户有余额，那么余额支付，否则支付宝支付
    if (parseFloat(this.data.hbaccount) >= parseFloat(this.data.zfje)) {
      this.setData({
        radiov: 2,
        hbchecked: true,
        yechecked: false,
        alichecked: false,
      })
    } else if (parseFloat(this.data.account) >= parseFloat(this.data.zfje)) {
      this.setData({
        radiov: 0,
        yechecked: true,
        hbchecked: false,
        alichecked: false,
      })
    } else {
      this.setData({
        radiov: 1,
        yechecked: false,
        hbchecked: false,
        alichecked: true,
      })
    }
    this.setData({
      flag: 1
    })
  },

  //按时按量确认支付
  ljzf(e){
    if (this.data.zfje == ''){
      wx.showModal({
        content: '请输入支付金额！',
        showCancel: false
      });
      return;
    }

    // 最低消费
    if(parseFloat(this.data.zfje) < parseFloat(this.data.mincharge)){
      wx.showModal({
        content: '亲', content: '最低消费金额为' + this.data.mincharge + '元！',
        showCancel: false
      });
      return;
    }

    // 金额不对
    if(parseFloat(this.data.zfje) >=9999){
      wx.showModal({
        content: '请输入正确的支付金额！',
        showCancel: false
      });
        return;
    }

    // 如果账户有余额，那么余额支付，否则支付宝支付
    if (parseFloat(this.data.hbaccount) >= parseFloat(this.data.zfje)) {
      this.setData({
        radiov: 2,
        hbchecked: true,
        yechecked: false,
        alichecked: false,
      })
    }else if(parseFloat(this.data.account) >= parseFloat(this.data.zfje)){
        this.setData({
          radiov:0,
          yechecked:true,
          hbchecked: false,
          alichecked:false,
        })
    }else{
        this.setData({
          radiov:1,
          yechecked:false,
          hbchecked: false,
          alichecked:true,
        })
    }
    this.setData({
      flag:1
    })
  },

  mfcd(){
    var cdczno = this.data.pluginfo.chargeplugNo;
    var sessionid = app.globalData.sessionid;
    var cmpn_id = this.data.cmpn_id;
    wx.request({
        url: app.httpUrl + '/ebike-charge/wxXcx/startMfcd.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          cdczno:cdczno,
          sessionid:sessionid,
          cmpn_id: cmpn_id
        },
        success: (re) => {
            if(re.data.status == '1'){
              // 跳转到
              wx.reLaunch({ url: '../main/main?msg=true'});
              //wx.redirectTo({ url: '../cdxx/cdxx?id=' + cdczno});
            }else{
              // 跳转到提示页面
              wx.redirectTo({ url: '../tipview/cdview/cdview?status=' + re.data.status});
            }
        },
        fail: () => {
        },
    });
  },

  bindKeyInput(e){
    this.setData({
      zfje: e.detail.value,
    });
  },

  back(e){
    this.setData({
      yebzzf:'',
      hbbzzf: '',
      flag:0
    })
  },

  showPlugMsg:function(cdczno,sessionid){
    console.log(cdczno);
    // 根据充电插座获取电站以及计费信息
    wx.request({
        url: app.httpUrl + '/ebike-charge/wxXcx/getCdzfDetail.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          cdczno:cdczno,
          sessionid:sessionid,
        },
        success: (re) => {
          if(re.data != null){
              var stinfo = re.data.stationinfo;//充电站信息
              var pluginfo = re.data.pluginfo;//插座信息
              // 是否模板被禁用，入禁用则提示不能充电
              if (stinfo.disabledSt == 'T'){
                // 跳转到提示页面
                wx.redirectTo({ url: '../tipview/cdview/cdview?status=disSt' });
              }else{
                var sfmzf;
                if (re.data.sfmzf) {
                  sfmzf = '1';
                } else {
                  sfmzf = '0';
                }

                if (pluginfo != null) {
                  this.setData({
                    pluginfo: pluginfo,
                  });
                }

                if (stinfo != null) {
                  this.setData({
                    stationinfo: stinfo,
                    glbz1: '0<功率≤' + stinfo.stepPower1 + 'W',
                    glbz2: stinfo.stepPower1 + '<功率≤' + stinfo.stepPower2 + 'W',
                    glbz3: stinfo.stepPower2 + '<功率≤' + stinfo.stepPower3 + 'W',
                    glbz4: '功率>' + stinfo.stepPower3 + 'W',
                  });
                }
                var hb = '0';
                if (typeof (re.data.hbaccount) != 'undefined') {
                  hb = re.data.hbaccount;
                }

                this.setData({
                  sfmzf: sfmzf,
                  cmpn_id: re.data.cmpn_id,
                  account: re.data.account,
                  hbaccount: hb,
                  mincharge: re.data.stationinfo.minCharge
                });

                if (!re.data.sfmzf){
                  this.getPackage();
                }
              }
          }
        },
        fail: () => {
        },
    });
  },

  // 页面
  getPackage() {
    console.log(this.data.stationinfo.id);
    wx.request({
      url: app.httpUrl + '/ebike-charge/cmpn/getCmpnListByStid.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        stid: this.data.stationinfo.id
      },
      success: (re) => {
        console.log(re.data);
        var c = re.data.jcount;
        this.setData({
          showPackage: c > 0 ? true :false
        })
        this.setData({
          packageCount: c,
          packageList: re.data.reList
        })
      }
    });
  },

  radioChange: function(e) {
    this.setData({
      yebzzf:'',
      hbbzzf:''
    })
    this.setData({
        radiov:e.detail.value // 选中框的值
    });
  },

  // 选择充电支付方式确认支付
  qrzf(e){
    console.log(this.data.radiov);
    var cdczno = this.data.pluginfo.chargeplugNo;
    // 余额支付
    if(this.data.radiov == '0'){
      //余额支付的时候余额必须大于支付金额，否则提示
      if(parseFloat(this.data.account) < parseFloat(this.data.zfje)){
          this.setData({
            yebzzf:'不足以支付！'
          })

          return;
      }
       wx.request({
          url: app.httpUrl + '/ebike-charge/wxpay/goWxYezf.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
          data: {
            sessionid:app.globalData.sessionid,
            zfje:this.data.zfje,
            orgno:this.data.pluginfo.subburo,         
            cdczno:cdczno,
          },
          success: (re) => {
            console.log("余额支付！状态为：" + re.data.status);
            //根据插座状态跳转页面
            // 跳转到充电信息页面
            if(re.data.status == '0'){
              wx.reLaunch({ url: '../main/main?msg=true'});
                //wx.redirectTo({ url: '../cdxx/cdxx?id=' + cdczno});
            //订单生成失败，原因见回传信息
            }else if(re.data.status == '10'){
              wx.showModal({
                title: '充电失败',
                content: re.data.msg,
                showCancel: false
              });
            //无效的插座
            }else{
              // 跳转到提示页面
              wx.redirectTo({ url: '../tipview/cdview/cdview?status=' + re.data.status});
            }
          },
          fail: () => {
          },
      });
    }else if (this.data.radiov == '2') {
      //红包支付的时候红包必须大于支付金额，否则提示
      if (parseFloat(this.data.hbaccount) < parseFloat(this.data.zfje)) {
        this.setData({
          hbbzzf: '不足以支付！'
        })

        return;
      }
      wx.request({
        url: app.httpUrl + '/ebike-charge/wxpay/goWxHbzf.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          sessionid: app.globalData.sessionid,
          zfje: this.data.zfje,
          orgno: this.data.pluginfo.subburo,
          cdczno: cdczno,
        },
        success: (re) => {
          console.log("红包支付状态为：" + re.data.status);
          //根据插座状态跳转页面
          // 跳转到充电信息页面
          if (re.data.status == '0') {
            wx.reLaunch({ url: '../main/main?msg=true'});
            //订单生成失败，原因见回传信息
          } else if (re.data.status == '10') {
            wx.showModal({
              title: '红包支付充电失败',
              content: re.data.msg,
              showCancel: false
            });
            //无效的插座
          } else {
            // 跳转到提示页面
            wx.redirectTo({ url: '../tipview/cdview/cdview?status=' + re.data.status });
          }
        },
        fail: () => {
        },
      });
    }else{
      console.log(app.globalData.sessionid)
      if (app.globalData.sessionid == null || app.globalData.sessionid == ''){
            wx.showModal({
              title: '亲',
              content: '您必须授权才能支付，请重新扫码！',
              showCancel: false
            });
        }else{      
          wx.request({
            url: app.httpUrl + '/ebike-charge/wxpay/goWxPay.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
            data: {
              sessionid:app.globalData.sessionid,
              zfje:this.data.zfje,
              orgno:this.data.pluginfo.subburo,         
              cdczno:cdczno,
            },
            success: (re) => {
              console.log(re);
              // 跳转到充电信息页面
              if(re.data.status == '0'){
                var ddid = re.data.ddid;
                wx.requestPayment({
                  timeStamp: re.data.payDto.timeStamp,
                  nonceStr: re.data.payDto.nonceStr,
                  package: re.data.payDto.package_str,
                  signType: re.data.payDto.signType,
                  paySign: re.data.payDto.paySign,
                  success: (res) => {
                      // 支付成功开启充电
                      wx.request({
                        url: app.httpUrl + '/ebike-charge/wxXcx/startZfbcd.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
                        data: {
                          cdczno: cdczno,
                          zfje: this.data.zfje,
                          orgno: this.data.pluginfo.subburo,
                          ddid: ddid,
                          sessionid: app.globalData.sessionid,
                        },
                        success: (re) => {
                          if (re.data.status == '0' || re.data.status == '1') {
                            // 跳转到充电信息页面
                            console.log(cdczno);
                            wx.reLaunch({ url: '../main/main?msg=true'});
                            //wx.redirectTo({ url: '../cdxx/cdxx?id=' + cdczno });
                          } else {
                            // 跳转到提示页面
                            wx.redirectTo({ url: '../tipview/cdview/cdview?status=' + re.data.status });
                          }
                        },
                        fail: () => {
                        },
                      });
                    //其他情况不跳转页面，留在本页面不动
                  },
                  fail: (res) => {
                  }
                })
              //订单生成失败，原因见回传信息
              }else if(re.data.status == '10'){
                wx.showModal({
                  title: '充电失败',
                  content: re.data.msg,
                  showCancel: false
                });
              //无效的插座
              }else{
                // 跳转到提示页面
                wx.redirectTo({ url: '../tipview/cdview/cdview?status=' + re.data.status});
              }
            },
            fail: () => {
            },
         });
        }     
    }
  },

  powerDrawer(e) {
    if(this.data.packageCount > 1){
      var currentStatu = e.currentTarget.dataset.statu;

      /* 动画部分 */
      // 第1步：创建动画实例 
      var animation = wx.createAnimation({
        duration: 200,  //动画时长
        timingFunction: "linear", //线性
        delay: 0  //0则不延迟
      });

      // 第2步：这个动画实例赋给当前的动画实例
      this.animation = animation;

      // 第3步：执行第一组动画
      animation.opacity(0).rotateX(-100).step();

      // 第4步：导出动画对象赋给数据对象储存
      this.setData({
        animationData: animation.export()
      })

      // 第5步：设置定时器到指定时候后，执行第二组动画
      setTimeout(function () {
        // 执行第二组动画
        animation.opacity(1).rotateX(0).step();
        // 给数据对象储存的第一组动画，更替为执行完第二组动画的动画对象
        this.setData({
          animationData: animation
        })

        //关闭
        if (currentStatu == "close") {
          this.setData(
            {
              showModalStatus: false
            }
          );
        }
      }.bind(this), 200)
      // 显示
      if (currentStatu == "open") {
        this.setData(
          {
            showModalStatus: true
          }
        );
      }
    }else{
      wx.navigateTo({
        url: '../user/cmpn/cmpnpackage/package?cmpn_id=' + this.data.packageList[0].cmpn_id
      })
    }
    
  },

  gocmpn(e) {
    var cmpnid = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../user/cmpn/cmpnpackage/package?cmpn_id=' + cmpnid
    })
  }
});
