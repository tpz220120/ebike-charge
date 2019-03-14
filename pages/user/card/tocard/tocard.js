var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    a: 0,
    cardid: '',
    userid:'',
    phone: '',
    othercardid: '',
    cardinfo: {},
    othercardinfo:{},
    hidden: true,
    animContentData: [],
    cardList:[],
    hasCard:0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    const animation = wx.createAnimation({
      duration: 200,
      timingFunction: 'cubic-bezier(.55, 0, .55, .2)',
    });
    this.contentAnim = animation;
    animation.translateY(0).step();
    this.setData({
      animContentData: animation.export(),
    });

    this.setData({
      cardid: options.cardid,
      userid: options.userid,
      phone: options.phone
    })
  },

  createContentHideAnim: function () {
    this.contentAnim.translateY('100%').step();
    this.setData({
      animContentData: this.contentAnim.export(),
    });
  },

  createContentShowAnim: function () {
    //查找数据
    wx.request({
      url: app.httpUrl + '/ebike-charge/card/getCardList.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        card_id: this.data.cardid,
        userid:this.data.userid,
        phone:this.data.phone,
      },
      success: (re) => {
        if (re.data.hasCard == '1'){
          this.setData({
            cardList: re.data.cardList,
            hasCard: 1
          });
        }else{
          this.setData({
            hasCard: 0
          });
        }
        
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
      fail: () => {
      },
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

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    wx.request({
      url: app.httpUrl + '/ebike-charge/card/getCardInfo.x', // 该url是自己的服务地址，实现的功能是服务端拿到authcode去开放平台进行token验证
      data: {
        card_id: this.data.cardid
      },
      success: (re) => {
        // 授权成功并且服务器端登录成功
        console.log(re);
        this.setData({
          cardinfo: re.data.info
        });
      },
      fail: () => {
      },
    });
    
  },

//确定转卡
  sure(e) {
    if (this.data.cardinfo.num_zs == 0 && this.data.cardinfo.num_xs == 0){
      wx.showModal({
        title: '温馨提示',
        content: '余额为0，转卡操作无效',
        showCancel: false
      });
    } else if (this.data.a==0) {
      wx.showModal({
        title: '温馨提示',
        content: '请选择一张要转入的卡',
        showCancel: false
      });
    }else{
      var that=this;
      wx.showModal({
        title: '提示',
        content: '确认将标识码为' + this.data.cardid + '的充电卡余额转入到标识码为' + this.data.othercardinfo.card_id + '的充电卡里',
        success(res) {
          if (res.confirm) {
            wx.request({
              url: app.httpUrl + '/ebike-charge/wxpay/cardToCard.x',
              data: {
                cardid: that.data.cardid,
                otherCardid: that.data.othercardinfo.card_id,
                phone: that.data.phone,
                zfje: that.data.cardinfo.amount
              },
              success: (re) => {
                // 跳转到充电信息页面
                if (re.data.status == '0') {
                  wx.showModal({
                    title: '卡转入成功',
                    content: '转入金额：' + that.data.cardinfo.amount + '元',
                    showCancel: false,
                    success: (r) => {
                      wx.navigateBack({
                        delta: 1
                      })
                    }
                  });
                } else if (re.data.status == '10' || re.data.status == '20') {
                  wx.showModal({
                    title: '卡转入失败',
                    content: re.data.msg,
                    showCancel: false
                  });
                }
              },
              fail: () => {
              },
            });
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },


  // 选择卡
  selcard(e) {
    this.setData({
      hidden: !this.data.hidden,
    })
    this.createContentShowAnim();
  },

  // 选择卡
  getOtherCard(e) {
    var index = e.currentTarget.dataset.cardindex;
    this.setData({
      othercardinfo: this.data.cardList[index],
      a:1
    })

    this.onModalCloseTap();
  },
})