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
    remainingCount: 0,
    totalCount: 0,
    expiringCount: 0,
    expiredCount: 0,
    fridgeOpen: true
  },

  onLoad() {
    this.loadData()
  },

  onShow() {
    this.loadData()
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
      frozenItems: frozenItems.slice(0, 4),
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
    this.filterByCategory(e.currentTarget.dataset.id)
  },

  onItemTap(e) {
    wx.navigateTo({ url: `/pages/detail/index?id=${e.currentTarget.dataset.id}` })
  },

  onDeleteItem(e) {
    const { id, name } = e.currentTarget.dataset
    wx.showModal({
      title: '移除食材',
      content: `确定要移除「${name}」吗？`,
      confirmColor: '#ff5252',
      success: (res) => {
        if (res.confirm) {
          storage.deleteItem(id)
          this.loadData()
          wx.showToast({ title: '已移除', icon: 'success' })
        }
      }
    })
  },

  toggleFridge() {
    this.setData({ fridgeOpen: !this.data.fridgeOpen })
  },

  onAddTap() {
    wx.switchTab({ url: '/pages/add/index' })
  }
})
