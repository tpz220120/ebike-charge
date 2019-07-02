var amapFile = require('../../../libs/amap-wx.js');
var config = require('../../../libs/config.js');

Page({
  data: {
    steps: {}
  },
  onLoad: function(option) {
    var that = this;
    var key = config.Config.key;
    var myAmapFun = new amapFile.AMapWX({key: key});
    myAmapFun.getRidingRoute({
      origin: option.origin,
      destination: option.destination,
      success: function(data){
        if(data.paths && data.paths[0] && data.paths[0].steps){
          that.setData({
            steps: data.paths[0].steps
          });
        }
          
      },
      fail: function(info){

      }
    })
  }
})