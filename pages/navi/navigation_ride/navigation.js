var amapFile = require('../../../libs/amap-wx.js');
var config = require('../../../libs/config.js');

Page({
  data: {
    markers: [],
    distance: '',
    cost: '',
    polyline: [],
    origin:'',
    destination:'',
    jd:'',
    wd:''
  },
  onLoad: function(option) {
    //经纬度设置
    this.setData({
      markers:[{
        iconPath: "../../../image/navi/mapicon_navi_s.png",
        id: 0,
        longitude: option.jd_start,
        latitude: option.wd_start,
        width: 23,
        height: 33
      }, {
        iconPath: "../../../image/navi/mapicon_navi_e.png",
        id: 0,
        longitude: option.jd_end,
        latitude: option.wd_end,
        width: 24,
        height: 34
      }],
      jd: option.jd_start,
      wd: option.wd_start,
      origin: option.jd_start + ',' + option.wd_start,
      destination: option.jd_end + ',' + option.wd_end
    })

    console.log(this.data.markers);
    var that = this;
    var key = config.Config.key;
    var myAmapFun = new amapFile.AMapWX({key: key});
    myAmapFun.getRidingRoute({
      origin: option.jd_start + ',' + option.wd_start,
      destination: option.jd_end + ',' + option.wd_end,
      success: function(data){
        var points = [];
        if(data.paths && data.paths[0] && data.paths[0].steps){
          var steps = data.paths[0].steps;
          for(var i = 0; i < steps.length; i++){
            var poLen = steps[i].polyline.split(';');
            for(var j = 0;j < poLen.length; j++){
              points.push({
                longitude: parseFloat(poLen[j].split(',')[0]),
                latitude: parseFloat(poLen[j].split(',')[1])
              })
            } 
          }
        }
        console.log(data);
        that.setData({
          polyline: [{
            points: points,
            color: "#0091ff",
            width: 6
          }]
        });
        if(data.paths[0] && data.paths[0].distance){
          that.setData({
            distance: data.paths[0].distance + '米'
          });
        }
        if (data.paths[0] && data.paths[0].duration) {
          that.setData({
            cost: parseInt(data.paths[0].duration / 60) + '分钟'
          });
        }
      },
      fail: function(info){

      }
    })
  },
  goDetail: function(){
    wx.navigateTo({
      url: '../navigation_ride_detail/navigation?origin= ' + this.data.origin + 
        '&destination=' + this.data.destination
    })
  },
})