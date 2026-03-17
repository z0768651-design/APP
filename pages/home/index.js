const storage = require('../../utils/storage')

Page({
  data: {
    totalCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    // 家具交互状态
    activeFurniture: '',
    // 时间问候
    greeting: '',
    timeIcon: ''
  },

  onLoad() {
    this._updateGreeting()
    this.loadStats()
  },

  onShow() {
    this.loadStats()
    this._updateGreeting()
  },

  _updateGreeting() {
    const hour = new Date().getHours()
    let greeting, timeIcon
    if (hour < 6)       { greeting = '深夜好';  timeIcon = '🌙' }
    else if (hour < 12) { greeting = '早上好';  timeIcon = '🌅' }
    else if (hour < 14) { greeting = '中午好';  timeIcon = '☀️' }
    else if (hour < 18) { greeting = '下午好';  timeIcon = '🌤' }
    else if (hour < 22) { greeting = '晚上好';  timeIcon = '🌆' }
    else                { greeting = '夜里好';  timeIcon = '🌛' }
    this.setData({ greeting, timeIcon })
  },

  loadStats() {
    const items = storage.getItems()
    const enriched = items.map(item => ({
      ...item,
      status: storage.getFreshStatus(item.expiryDate)
    }))
    this.setData({
      totalCount: enriched.length,
      expiringCount: enriched.filter(i => i.status === 'soon').length,
      expiredCount: enriched.filter(i => i.status === 'expired').length
    })
  },

  // 点击有功能的家具
  onFurnitureTap(e) {
    const { id, route } = e.currentTarget.dataset
    wx.vibrateShort({ type: 'light' })
    this.setData({ activeFurniture: id })
    setTimeout(() => {
      this.setData({ activeFurniture: '' })
    }, 300)
    if (route) {
      wx.navigateTo({ url: route })
    } else {
      wx.showToast({ title: '即将推出 ✨', icon: 'none', duration: 1200 })
    }
  },

  // 点击冰箱（特殊处理，显示小动画再跳转）
  onFridgeTap() {
    wx.vibrateShort({ type: 'medium' })
    this.setData({ activeFurniture: 'fridge' })
    setTimeout(() => {
      this.setData({ activeFurniture: '' })
      wx.navigateTo({ url: '/pages/index/index' })
    }, 280)
  }
})
