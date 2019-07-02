var utils = require('../../util/util')
var app = getApp();
//地图展示附近100km之内的99个电站，无论地图缩放还是变大，如果中心点不变化不重新加载
Page({
  data: {
    tipshow:'0',
    tipshow2:'0',
    tipname:'',
    stid:'',
    scale: 16,
    longitude:'',
    latitude:'',
    markers:[],
    controls:[],
    mainHeight:500,
    sfjz:false,///刚开始数据是否加载完成，防止regionMap重复调用
    regionover:true,///一次regionMap结束后不能重复调用
    regionjd:'',//上一次移动的经度
    regionwd:'',//上一次移动的维度
    ifshow:false,
    qcode:'',//关联二维码扫码进来是否已关联
    tzurl:'',//关联二维码跳转的url
    jd_end:'',
    wd_end:'',//导航用
    read:''// 通知信息是否已读
  },
  
  onShow(){
    if (app.globalData.userPhone == '' && this.data.ifshow) {
        // 绑定后跳转到首页
        wx.navigateTo({ url: '../user/bindphone/bindphone?phone=&url=main' });
    }

    // 关联二维码等进来时没获取过定位信息等情况
    if (this.data.tzurl != '') {
      this.getJwd();
    }

    // 刷新首页打开充电站信息
    if(this.data.tipshow2 == '1'){
      let that = this;
      wx.request({
        url: app.httpUrl + '/ebike-charge/wxXcx/getStName.x',
        data: {
          id: that.data.stid
        },
        success: (re) => {
          if (re.data != null) {
            that.setData({
              kxnum: re.data.kxnum,
              cdnum: parseInt(re.data.plugCount) - parseInt(re.data.kxnum),
            });
          }
        },
        fail: () => {
          // 根据自己的业务场景来进行错误处理
        },
      });
    }
  },

  onLoad(options){
    if (options.msg){
      wx.showModal({
        title: '充电开始',
        content: '请到个人中心-当前充电查看充电进度',
        showCancel:false,
      })
    }

    console.log("关联二维码跳转options==" + JSON.stringify(options));  
    var that = this;
    app.getSessionId().then(function (sessionid) {    
      if (app.globalData.userPhone == '') {
        // 绑定后跳转到首页
        wx.navigateTo({ url: '../user/bindphone/bindphone?phone=&url=main' });
      }else{
        that.setData({
          ifshow: true,
        });

        if (options.q) {
          let q = decodeURIComponent(options.q)
          if (q) {
            console.log("全局onLaunch onload url=" + q)
            console.log("全局onLaunch onload 参数 cdczno=" + utils.getQueryString(q, 'cdczno'))

            if (utils.getQueryString(q, 'cdczno')) {
              // 绑定手机后跳转到支付页面
              let code = utils.getQueryString(q, 'cdczno');

              //扫码判断插座状态
              wx.request({
                url: app.httpUrl + '/ebike-charge/wxXcx/getCzgk.x',
                data: {
                  cdczno: code
                },
                success: (re) => {
                  // 插座不是空闲，跳转到提示页面
                  if (re.data.status != '0') {
                    // 跳转到提示页面
                    that.setData({
                      tzurl: '../tipview/cdview/cdview?status=' + re.data.status
                    });
                  } else {
                    that.setData({
                      tzurl: '../paycharge/paycharge?id=' + code,
                      qcode: code,
                    });
                  }

                  wx.navigateTo({
                    url: that.data.tzurl,
                  })
                },
                fail: () => {
                  reject({});
                },
              });
            } else if (utils.getQueryString(q, 'device')) {
              // 绑定手机后跳转到选择插座页面
              let code = utils.getQueryString(q, 'device');
              that.setData({
                tzurl: '../charge/onecharge/onecharge?devno=' + code,
                qcode: code,
              });

              wx.navigateTo({
                url: that.data.tzurl,
              })
            }
          }
        }

        that.getSfread(sessionid);

        if (that.data.tzurl == '') {
          that.getJwd();
        }
      }      
    });
  },

  getJwd:function(){
    var that = this;
    wx.getSetting({
      success(setRes) {
        // 判断是否已授权
        console.log(setRes.authSetting);
        if (!setRes.authSetting['scope.userLocation']) {
          // 授权访问
          wx.authorize({
            scope: 'scope.userLocation',
            success() {
              cosole.log(222);
              wx.getLocation({
                type: 'gcj02',
                success(res) {
                  that.setData({
                    longitude: res.longitude,
                    latitude: res.latitude,
                  });
                  that.showMainMap(res.longitude, res.latitude);
                },
              })
            },
            fail(res) {
              // 失败的话用华星的定位
              wx.showModal({
                title: '获取定位失败',
                content: '请点击左下角定位，选择使用我的地理位置！',
                showCancel: false,
                success() {
                  that.setData({
                    longitude: '120.123103',
                    latitude: '30.280724',
                  });
                  that.showMainMap('120.123103', '30.280724');
                }
              });
            }
          });
        } else {
          wx.getLocation({
            type: 'gcj02',
            success(res) {
              that.setData({
                longitude: res.longitude,
                latitude: res.latitude,
              });
              that.showMainMap(res.longitude, res.latitude);
            },
            fail() {
              wx.showModal({
                title: '获取定位失败',
                content: '请点击左下角定位，选择使用我的地理位置！',
                showCancel: false,
                success() {
                  that.setData({
                    longitude: '120.123103',
                    latitude: '30.280724',
                  });
                  that.showMainMap('120.123103', '30.280724');
                }
              });
            },
          })
        }
      }
    });    
  },

  getSfread: function (sessionid) {
    var that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/logMsg/countMsg.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        sessionid: sessionid
      },
      success: (re) => {
          that.setData({
            read: re.data.no_read_count
          });
      }
    });
  },

  showMainMap:function(longitude, latitude){
    wx.showLoading();
    console.log(longitude);
    console.log(latitude);
    var that = this;
    wx.request({
      url: app.httpUrl + '/ebike-charge/wxXcx/getStationList.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        longitude: longitude,
        latitude: latitude,
        limit: 99,// 99个站点
        dis: 100,// 100km
      },
      success: (re) => {
        if (re.data != null) {
          var st = re.data.stlist;
          var insStDate = new Array();
          //var includeDate = new Array();
          var k = 0;
          for (var i = 0; i < st.length; i++) {
            var stDate = st[i];
            var market = new Object();
            market.id = stDate.id;
            market.latitude = stDate.latitude;
            market.longitude = stDate.longitude;
            market.width = 36;
            market.height = 45;
            market.iconPath = '/image/mark-kx.png';
            insStDate[i] = market;
            // // 显示1km内的圈
            // if(stDate.distance < 1){
            //     var inc = new Object();
            //     inc.latitude=stDate.latitude;
            //     inc.longitude=stDate.longitude;
            //     includeDate[k] = inc;
            //     k++;
            // }
          }

          // 地图中心的market
          var marketc = new Object();
          marketc.id = 'center';
          marketc.latitude = latitude;
          marketc.longitude = longitude;
          marketc.width = 20;
          marketc.height = 33;
          marketc.iconPath = '/image/mark-dw.png';
          insStDate[st.length] = marketc;

          console.log(insStDate);
          that.setData({
            //includePoints:includeDate,
            markers: insStDate,
          });

          // 使用 wx.createMapContext 获取 map 上下文
          that.mapCtx = wx.createMapContext('map');
          var controlsarray = [
          ];
          if (re.data.hb > 0) {
            controlsarray.push(
              {
                id: 6,
                position: {
                  left: app.globalData.apiW - 80,
                  top: app.globalData.apiH * 0.2,
                  width: 80,
                  height: 80,
                },
                iconPath: '/image/main-hb.gif',
                clickable: true,
              });
          }
          that.setData({
            mainHeight: app.globalData.apiH,
            controls: controlsarray,
            sfjz: true,
          })

          wx.hideLoading();
        }
      },
      fail: () => {
        // 根据自己的业务场景来进行错误处理
        wx.hideLoading();
      },
    });
  },

  controltap(e) {
    console.log(e.controlId);
    // 定位
    var that = this;
    if (e.controlId === 6) {
      wx.navigateTo({ url: '../user/cmpn/cmpnList' });
    }
  },

  getCenter:function(){
    let that = this;
      wx.getLocation({
        type: 'gcj02',
        success(res) {
          that.setData({
            longitude: res.longitude,
            latitude: res.latitude
          });

          that.mapCtx.moveToLocation();
          // 地图中心的market
          var st = that.data.markers;
          for (var i = 0; i < st.length; i++) {
            var stDate = st[i];
            if (stDate.id == 'center') {
              var latitude = 'markers[' + i + '].latitude';
              var longitude = 'markers[' + i + '].longitude';
              that.setData({
                //includePoints:includeDate,
                [latitude]: res.latitude,
                [longitude]: res.longitude,
              });

              break;
            }
          }

          wx.request({
            url: app.httpUrl + '/ebike-charge/wxXcx/getStationList.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
            data: {
              longitude: res.longitude,
              latitude: res.latitude,
              limit: 99,// 99个站点
              dis: 100,// 100km
            },
            success: (re) => {
              if (re.data != null) {
                var st = re.data.stlist;
                var insStDate = new Array();
                var k = 0;
                for (var i = 0; i < st.length; i++) {
                  var stDate = st[i];
                  var market = new Object();
                  market.id = stDate.id;
                  market.latitude = stDate.latitude;
                  market.longitude = stDate.longitude;
                  market.width = 36;
                  market.height = 45;
                  market.iconPath = '/image/mark-kx.png';
                  insStDate[i] = market;
                }

                // 地图中心的market
                var marketc = new Object();
                marketc.id = 'center';
                marketc.latitude = res.latitude;
                marketc.longitude = res.longitude;
                marketc.width = 20;
                marketc.height = 33;
                marketc.iconPath = '/image/mark-dw.png';
                insStDate[st.length] = marketc;

                that.setData({
                  markers: insStDate,
                  longitude: res.longitude,
                  latitude: res.latitude,
                  regionover: true,
                });

                console.log(that.data.regionover);
                wx.hideLoading();
              }
            },
            fail: () => {
              // 根据自己的业务场景来进行错误处理
              wx.hideLoading();
            },
          });
        },
        fail() {
          // wx.showModal({
          //   content: '定位失败，请打开手机定位功能！',
          //   showCancel: false
          // });
        },
      })
  },

  regionchange(e) {
    // 上一次跟本次移动的经纬度一致的情况下，不重复调用
    console.log(e);
    // 注意：如果缩小或者放大了地图比例尺以后，请在 onRegionChange 函数中重新设置 data 的
    // scale 值，否则会出现拖动地图区域后，重新加载导致地图比例尺又变回缩放前的大小。
    if (e.type === 'end' && this.data.sfjz && this.data.regionover && e.causedBy === 'drag') {
      this.setData({
        //includePoints:includeDate,
        regionover:false
      });
      wx.showLoading();
      var that = this;
      // 根据中心点获取坐标
      this.mapCtx.getCenterLocation({
        success: function (res) {
          wx.request({
            url: app.httpUrl + '/ebike-charge/wxXcx/getStationList.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
            data: {
              longitude: res.longitude,
              latitude: res.latitude,
              limit: 99,// 99个站点
              dis: 100,// 100km
            },
            success: (re) => {
              
              if (re.data != null) {
                var st = re.data.stlist;
                var insStDate = new Array();
                var k = 0;
                for (var i = 0; i < st.length; i++) {
                  var stDate = st[i];
                  var market = new Object();
                  market.id = stDate.id;
                  market.latitude = stDate.latitude;
                  market.longitude = stDate.longitude;
                  market.width = 36;
                  market.height = 45;
                  market.iconPath = '/image/mark-kx.png';
                  insStDate[i] = market;
                }

                // 地图中心的market
                var marketc = new Object();
                marketc.id = 'center';
                marketc.latitude = res.latitude;
                marketc.longitude = res.longitude;
                marketc.width = 20;
                marketc.height = 33;
                marketc.iconPath = '/image/mark-dw.png';
                insStDate[st.length] = marketc;

                that.setData({
                  markers: insStDate,
                  longitude: res.longitude,
                  latitude: res.latitude,
                  regionover: true,
                });

                console.log(that.data.regionover);
                wx.hideLoading();
              }
            },
            fail: () => {
              // 根据自己的业务场景来进行错误处理
              wx.hideLoading();
            },
          });
        }
      })
    } 
  },
  markertap(e) {
    //根据id查找电站名称以及插座的状况
    var stid = e.markerId;
    if(stid != 'center'){
      this.setData({
        tipshow2: '1',
      });
      wx.request({
          url: app.httpUrl + '/ebike-charge/wxXcx/getStName.x', 
          data: {
            id: stid
          },
          success: (re) => {
            if(re.data != null){
              this.setData({
                tipname:re.data.name,
                kxnum:re.data.kxnum,
                cdnum: parseInt(re.data.plugCount) - parseInt(re.data.kxnum),
                stid:re.data.id,
                tipshow: '1',
                jd_end: re.data.longitude,
                wd_end: re.data.latitude
              });
            }
              
          },
          fail: () => {
            // 根据自己的业务场景来进行错误处理
          },
      });
    }
  },
  tap(e) {
    this.setData({
        tipshow: '0',
        tipshow2:'0'
      });
  },

  goDetail(e) {
    wx.navigateTo({ url: '../charge/charge?id=' + this.data.stid });
  },

  goNavi(e) {
    wx.navigateTo({
      url: '../navi/navigation_ride/navigation?jd_start=' + this.data.longitude 
    + '&wd_start=' + this.data.latitude
    + '&jd_end=' + this.data.jd_end
    + '&wd_end=' + this.data.wd_end});
  },

  goMainBtn(e) {
    var id = e.currentTarget.dataset.id;
    // 定位
    var that = this;
    // 投诉建议
    if (id == 1) {
      wx.navigateTo({ url: '../tsjy/tsjy' });
    } else if (id == 2) {
      // 充电说明
      wx.navigateTo({ url: '../cdsm/cdsm' });
    } else if (id == 3) {
      // 扫码充电
      wx.scanCode({
        scanType: 'qrCode',
        success: (res) => {
          console.log(res);
          if (res.result.split('?').length < 2) {
            wx.navigateTo({ url: '../tipview/cdview/cdview?status=wx' });
          } else {
            var cs = res.result.split('?')[1];
            // 二维码规则
            if (cs.split("&").length == 1) {
              var name = cs.split("=")[0];
              var id = cs.split("=")[1];
              if (name == 'cdczno') {
                // 根据充电插座编号查找插座信息
                // 根据充电插座获取插座状态，如果
                wx.request({
                  url: app.httpUrl + '/ebike-charge/wxXcx/getCzgk.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
                  data: {
                    cdczno: id
                  },
                  success: (re) => {
                    // 插座不是空闲，跳转到提示页面
                    if (re.data.status != '0') {
                      // 跳转到提示页面
                      wx.navigateTo({ url: '../tipview/cdview/cdview?status=' + re.data.status });
                    } else {
                      wx.navigateTo({ url: '../paycharge/paycharge?id=' + id });
                    }
                  },
                  fail: () => {
                    reject({});
                  },
                });
              } else if (name == 'device') {
                // 扫描设备跳转到设备插座选择页面
                wx.navigateTo({ url: '../charge/onecharge/onecharge?devno=' + id });
              } else {
                wx.navigateTo({ url: '../tipview/cdview/cdview?status=wx' });
              }
            } else {
              wx.navigateTo({ url: '../tipview/cdview/cdview?status=wx' });
            }
          }
        },
      });
    } else if (id == 4) {
      // 通知消息推送
      wx.navigateTo({ url: '../message/message' });
    }
  },

  goList(e) {
    wx.navigateTo({ url: 'mainlist/mainlist?longitude=' + this.data.longitude + '&latitude=' + this.data.latitude});
  },
  goUserCenter(e) {
    // 我的
    wx.navigateTo({ url: '../user/user' });
  },

  goLocation(e){
    var that = this;
    wx.getSetting({
      success(setRes) {
        // 判断是否已授权
        console.log(setRes.authSetting);
        if (!setRes.authSetting['scope.userLocation']) {
              wx.openSetting({
                success(res) {
                  console.log(res.authSetting['scope.userLocation']);
                  if (res.authSetting['scope.userLocation']) {
                    that.getCenter();
                  } else {
                    wx.showModal({
                      content: '建议打开定位，否则无法获取您的当前位置！',
                      showCancel: false
                    });
                  }
                }, fail(res) {
                  console.log(2222232);
                }
              })
        } else {
          that.getCenter();
        }
      }
    });
  },

  goMall(e) {
    // 西湖购小程序跳转
    console.log("点击广告跳转西湖购");
    wx.navigateToMiniProgram({
      appId: 'wxc92a56ebbba6826c',
      success(res) {
        console.log("success=");
        console.log(res);
      },
      fail(re) {
        console.log("fail=");
        console.log(re);
      }
    })
  },
});
