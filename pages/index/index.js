const storage = require('../../utils/storage')
const { CATEGORIES } = require('../../utils/ingredients')

Page({
  data: {
    allItems: [],
    filteredItems: [],
    categories: CATEGORIES,
    activeCategory: 'all',
    previewItems: [],
    frozenItems: [],
    mainFridgeItems: [],
    remainingCount: 0,
    totalCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    // 大冰箱模态框
    fridgeModalOpen: false,
    fridgeDoorOpening: false,
    // 蜘蛛动画
    spiderActive: false,
    spiderState: '', // 'crawl' | 'eat' | 'done'
    spiderItem: null
  },

  _spiderTimer1: null,
  _spiderTimer2: null,
  _spiderTimer3: null,

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
  },

  onUnload() {
    clearTimeout(this._spiderTimer1)
    clearTimeout(this._spiderTimer2)
    clearTimeout(this._spiderTimer3)
  },

  loadData() {
    const items = storage.getItems()
    const enriched = items.map(item => ({
      ...item,
      status: storage.getFreshStatus(item.expiryDate),
      expiryText: storage.getExpiryText(item.expiryDate)
    }))

    const expiredCount = enriched.filter(i => i.status === 'expired').length
    const expiringCount = enriched.filter(i => i.status === 'soon').length
    const mainItems = enriched.filter(i => !i.frozen)
    const frozenItems = enriched.filter(i => i.frozen)
    const previewItems = mainItems.slice(0, 8)
    const remainingCount = Math.max(0, mainItems.length - 8)

    this.setData({
      allItems: enriched,
      frozenItems,
      mainFridgeItems: mainItems,
      previewItems,
      remainingCount,
      totalCount: enriched.length,
      expiringCount,
      expiredCount
    })

    this.filterByCategory(this.data.activeCategory)
  },

  filterByCategory(categoryId) {
    const filtered = categoryId === 'all'
      ? this.data.allItems
      : this.data.allItems.filter(i => i.category === categoryId)
    this.setData({ filteredItems: filtered, activeCategory: categoryId })
  },

  onCategoryTap(e) {
    wx.vibrateShort({ type: 'light' })
    this.filterByCategory(e.currentTarget.dataset.id)
  },

  onItemTap(e) {
    wx.vibrateShort({ type: 'light' })
    wx.navigateTo({ url: `/pages/detail/index?id=${e.currentTarget.dataset.id}` })
  },

  onDeleteItem(e) {
    const { id, name, icon } = e.currentTarget.dataset
    if (this.data.spiderActive) return

    wx.vibrateShort({ type: 'medium' })
    this.setData({
      spiderActive: true,
      spiderState: 'crawl',
      spiderItem: { id, name, icon: icon || '🍽️' }
    })

    // 蜘蛛爬到食物旁边
    this._spiderTimer1 = setTimeout(() => {
      this.setData({ spiderState: 'eat' })
      wx.vibrateShort({ type: 'heavy' })
    }, 1200)

    // 食物被吃完，蜘蛛满足
    this._spiderTimer2 = setTimeout(() => {
      this.setData({ spiderState: 'done' })
    }, 2000)

    // 删除数据，关闭动画
    this._spiderTimer3 = setTimeout(() => {
      storage.deleteItem(id)
      this.loadData()
      this.setData({ spiderActive: false, spiderState: '', spiderItem: null })
      wx.showToast({ title: '被蜘蛛吃掉啦！', icon: 'none', duration: 1500 })
    }, 2800)
  },

  // 点击冰箱主体 - 打开大冰箱
  onFridgeTap() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ fridgeDoorOpening: true })
    setTimeout(() => {
      this.setData({ fridgeModalOpen: true, fridgeDoorOpening: false })
    }, 300)
  },

  onCloseFridgeModal() {
    wx.vibrateShort({ type: 'light' })
    this.setData({ fridgeModalOpen: false })
  },

  noop() {},

  onFridgeItemTap(e) {
    wx.vibrateShort({ type: 'light' })
    this.setData({ fridgeModalOpen: false })
    setTimeout(() => {
      wx.navigateTo({ url: `/pages/detail/index?id=${e.currentTarget.dataset.id}` })
    }, 250)
  },

  onAddTap() {
    wx.switchTab({ url: '/pages/add/index' })
  },

  onAddFromModal() {
    this.setData({ fridgeModalOpen: false })
    setTimeout(() => {
      wx.switchTab({ url: '/pages/add/index' })
    }, 250)
  }
})
