var app =getApp();

Page({
  data: {
    info:{},
    ycper:'',
    cdgl:'',
    ycdname:'已充电（分）',
    usageAmount:'',
    sycdname:'剩余时间（分）',
    surplusAmount:'',
    glbz1:'',
    glbz2:'',
    glbz3:'',
    glbz4:'',
    sfmzf:'0',
    cdczno:'',//刷新用
    recordid:'',//从个人进来的时候根据充电记录查找相关充电信息
    optype:'',
  },
  onLoad(option) {
    const id = option.id;
    console.log('充电插座编号' + id);
    var url = '';
    if(option.type =='user-cdxx'){
      url = app.httpUrl + '/ebike-charge/wxxcxUserCenter/goDqcdxx.x';
      this.setData({
        recordid:id,
        optype:option.type
      })
    }else{
      url = app.httpUrl + '/ebike-charge/wxXcx/getDqcdxxDetail.x';
      this.setData({
        cdczno:id,
      })
    }

    console.log(url);

    // 根据充电插座获取电站以及计费信息
    wx.request({
        url: url, // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          id:id
        },
        success: (re) => {
          if(re.data != null){
             console.log(re.data);
             //查找不出充电订单记录
             if(re.data.status != 'end'){
               var info = re.data.info;//插座信息
               this.setData({
                 ycper: re.data.ycper,
                 cdgl: re.data.cdgl,
                 info: info,
                 sfmzf: re.data.sfmzf,
               });

               if (info.chargeType == '01') {
                 this.setData({
                   ycdname: '已充电（分）',
                   sycdname: '剩余时间（分）',
                   usageAmount: info.usageAmountStr,
                   surplusAmount: info.surplusAmountStr,
                   glbz1: '0<功率≤' + info.stepPower1 + 'W',
                   glbz2: info.stepPower1 + '<功率≤' + info.stepPower2 + 'W',
                   glbz3: info.stepPower2 + '<功率≤' + info.stepPower3 + 'W',
                   glbz4: '功率>' + info.stepPower3 + 'W',
                 });
               } else if (info.chargeType == '02') {
                 this.setData({
                   ycdname: '已充电（kWh）',
                   sycdname: '剩余电量（kWh）',
                   usageAmount: info.usageAmount,
                   surplusAmount: info.surplusAmount
                 });
               }
             }else{
               wx.showModal({
                 title: '亲',
                 content: '无法查找到当前充电信息，请到充电记录里查看！',
                 showCancel:false
               })
             } 
          }
        },
        fail: () => {
        },
    });
  },

  onPullDownRefresh() {
    const type = this.data.optype;
    var id;
    var url;
    if(type =='user-cdxx'){
      url = app.httpUrl + '/ebike-charge/wxxcxUserCenter/goDqcdxx.x';
      id = this.data.recordid;
    }else{
      url = app.httpUrl + '/ebike-charge/wxXcx/getDqcdxxDetail.x';
      id = this.data.cdczno;
    }
    // 根据充电插座获取电站以及计费信息
    wx.request({
        url: url, // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
        data: {
          id:id
        },
        success: (re) => {
          // 充电结束进历史了，直接跳转到历史页面
          if(re.data.status == 'end'){
             wx.redirectTo({ url: '../main/main'});//暂时跳转到首页
          }else{
              console.log(re.data);
              var info = re.data.info;//插座信息
              this.setData({
                  ycper:re.data.ycper,
                  cdgl:re.data.cdgl,
                  info:info,
                  sfmzf:re.data.sfmzf,
              });
              wx.stopPullDownRefresh();
          }
        },
        fail: () => {
        },
    });
  },
});
