const storage = require('../../utils/storage')

// 家具配置：位置 + 功能
const FURNITURE_CONFIG = {
  // 厨房
  fridge: {
    x: 60, y: 120,
    name: '冰箱',
    action: 'navigate',
    route: '/pages/index/index'
  },
  stove: {
    x: 170, y: 110,
    name: '灶台',
    action: 'modal',
    title: '🍳 灶台',
    desc: '今天想做什么菜？\n可以根据冰箱里的食材推荐菜谱',
    btnText: '查看食材',
    modalAction: 'goFridge'
  },
  sink: {
    x: 190, y: 200,
    name: '水槽',
    action: 'toast',
    title: '💧 哗啦啦~',
    desc: '水槽在放水，记得关水龙头哦'
  },
  cabinet: {
    x: 80, y: 240,
    name: '橱柜',
    action: 'modal',
    title: '🗄️ 橱柜',
    desc: '这里存放调味料和厨具\n盐、糖、酱油都在这里',
    btnText: '整理橱柜',
    modalAction: 'toast:已整理完毕！✨'
  },

  // 客厅
  tv: {
    x: 410, y: 100,
    name: '电视',
    action: 'modal',
    title: '📺 电视',
    desc: '要看什么节目呢？\n今日推荐：美食纪录片',
    btnText: '开电视',
    modalAction: 'toast:正在播放美食纪录片 📺'
  },
  sofa: {
    x: 400, y: 190,
    name: '沙发',
    action: 'toast',
    title: '😌 好舒服~',
    desc: '坐在沙发上休息一下吧'
  },
  table: {
    x: 460, y: 195,
    name: '茶几',
    action: 'toast',
    title: '☕ 喝杯茶',
    desc: '茶几上有一杯热茶'
  },
  plant: {
    x: 540, y: 110,
    name: '盆栽',
    action: 'modal',
    title: '🌱 盆栽',
    desc: '这棵小植物看起来需要浇水了',
    btnText: '浇水',
    modalAction: 'toast:浇水完成！植物精神多了 🌿'
  },

  // 卧室
  bed: {
    x: 80, y: 430,
    name: '床',
    action: 'modal',
    title: '🛏️ 温暖的床',
    desc: '要小睡一会儿吗？\n设定一个闹钟提醒你起来',
    btnText: '小睡15分钟',
    modalAction: 'nap'
  },
  wardrobe: {
    x: 220, y: 420,
    name: '衣柜',
    action: 'modal',
    title: '👔 衣柜',
    desc: '今天穿什么呢？\n衣服都整理得井井有条',
    btnText: '换衣服',
    modalAction: 'toast:换好衣服啦！焕然一新 ✨'
  },
  desk: {
    x: 80, y: 530,
    name: '书桌',
    action: 'modal',
    title: '📚 书桌',
    desc: '桌上有一本书和一盏台灯\n要学习还是记笔记？',
    btnText: '开始学习',
    modalAction: 'toast:专注学习中...📖'
  },

  // 卫生间
  shower: {
    x: 400, y: 430,
    name: '淋浴',
    action: 'toast',
    title: '🚿 哗啦~',
    desc: '洗个热水澡放松一下'
  },
  toilet: {
    x: 520, y: 430,
    name: '马桶',
    action: 'toast',
    title: '🚽 ...',
    desc: '有些事情就不描述了'
  },
  basin: {
    x: 450, y: 530,
    name: '洗手台',
    action: 'modal',
    title: '🪥 洗手台',
    desc: '洗手、刷牙、照镜子\n保持卫生好习惯',
    btnText: '洗手',
    modalAction: 'toast:手洗干净了！🧼'
  },

  // 大门
  door: {
    x: 300, y: 580,
    name: '大门',
    action: 'modal',
    title: '🚪 大门',
    desc: '要出门吗？\n记得检查冰箱里有没有快过期的食材',
    btnText: '查看冰箱',
    modalAction: 'goFridge'
  }
}

Page({
  data: {
    totalCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    activeFurniture: '',
    greeting: '',
    timeIcon: '',
    // 小人位置（初始在走廊中间）
    charX: 260,
    charY: 310,
    charWalking: false,
    charDir: 'down',
    // 弹窗
    showModal: false,
    modalTitle: '',
    modalDesc: '',
    modalBtnText: '',
    modalAction: ''
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

  // 点击家具 -> 小人走过去 -> 触发功能
  onFurnitureTap(e) {
    const id = e.currentTarget.dataset.id
    const config = FURNITURE_CONFIG[id]
    if (!config) return

    wx.vibrateShort({ type: 'light' })

    // 计算方向
    const curY = this.data.charY
    const targetY = config.y
    const dir = targetY > curY ? 'down' : 'up'

    // 开始走路
    this.setData({
      charWalking: true,
      charDir: dir,
      charX: config.x,
      charY: config.y,
      activeFurniture: id
    })

    // 走路结束后触发功能
    const walkTime = 800
    setTimeout(() => {
      this.setData({
        charWalking: false,
        activeFurniture: ''
      })
      this._triggerAction(id, config)
    }, walkTime)
  },

  _triggerAction(id, config) {
    switch (config.action) {
      case 'navigate':
        wx.navigateTo({ url: config.route })
        break

      case 'toast':
        wx.showToast({
          title: config.title,
          icon: 'none',
          duration: 1500
        })
        break

      case 'modal':
        this.setData({
          showModal: true,
          modalTitle: config.title,
          modalDesc: config.desc,
          modalBtnText: config.btnText || '',
          modalAction: config.modalAction || ''
        })
        break
    }
  },

  onCloseModal() {
    this.setData({ showModal: false })
  },

  onModalAction() {
    const action = this.data.modalAction
    this.setData({ showModal: false })

    if (action === 'goFridge') {
      wx.navigateTo({ url: '/pages/index/index' })
    } else if (action === 'nap') {
      wx.showToast({ title: '💤 开始小睡...', icon: 'none', duration: 1500 })
      // 15分钟后提醒（仅展示概念）
      setTimeout(() => {
        wx.showToast({ title: '⏰ 该起来啦！', icon: 'none', duration: 2000 })
      }, 3000)
    } else if (action.startsWith('toast:')) {
      const msg = action.slice(6)
      wx.showToast({ title: msg, icon: 'none', duration: 1500 })
    }
  }
})
