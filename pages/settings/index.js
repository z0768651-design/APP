const storage = require('../../utils/storage')
const { LANGUAGES } = require('../../utils/ingredients')

Page({
  data: {
    languages: LANGUAGES,
    settings: {
      language: 'en',
      multiLang: false,
      extraLang: 'ja'
    },
    totalItems: 0,
    expiredItems: 0,
    version: '1.0.0'
  },

  onShow() {
    const settings = storage.getSettings()
    const items = storage.getItems()
    this.setData({
      settings,
      totalItems: items.length,
      expiredItems: items.filter(i => storage.getFreshStatus(i.expiryDate) === 'expired').length
    })
  },

  onCityInput(e) {
    const city = e.detail.value
    const newSettings = { ...this.data.settings, city }
    storage.saveSettings(newSettings)
    this.setData({ settings: newSettings })
  },

  onLangSelect(e) {
    const { id } = e.currentTarget.dataset
    const newSettings = { ...this.data.settings, language: id }
    storage.saveSettings(newSettings)
    this.setData({ settings: newSettings })
    wx.showToast({ title: `已切换到${LANGUAGES.find(l => l.id === id).name}`, icon: 'success' })
  },

  onClearExpired() {
    wx.showModal({
      title: '清除过期食材',
      content: '确定移除所有已过期食材吗？',
      confirmColor: '#ff5252',
      success: (res) => {
        if (res.confirm) {
          const items = storage.getItems()
          const valid = items.filter(i => storage.getFreshStatus(i.expiryDate) !== 'expired')
          storage.saveItems(valid)
          this.setData({ expiredItems: 0, totalItems: valid.length })
          wx.showToast({ title: `已清除过期食材`, icon: 'success' })
        }
      }
    })
  },

  onClearAll() {
    wx.showModal({
      title: '⚠ 清空冰箱',
      content: '确定清空所有食材吗？此操作不可撤销！',
      confirmColor: '#ff5252',
      success: (res) => {
        if (res.confirm) {
          storage.saveItems([])
          this.setData({ totalItems: 0, expiredItems: 0 })
          wx.showToast({ title: '冰箱已清空', icon: 'success' })
        }
      }
    })
  },

  onAddSampleData() {
    const { INGREDIENTS_DB } = require('../../utils/ingredients')
    const samples = [
      { tpl: 'apple',    qty: 5, unit: '个',  daysOffset: 10,  frozen: false },
      { tpl: 'milk',     qty: 2, unit: '盒',  daysOffset: 5,   frozen: false },
      { tpl: 'egg',      qty: 12, unit: '个', daysOffset: 18,  frozen: false },
      { tpl: 'chicken',  qty: 300, unit: '克', daysOffset: 2,  frozen: false },
      { tpl: 'broccoli', qty: 1, unit: '棵',  daysOffset: 3,   frozen: false },
      { tpl: 'salmon',   qty: 200, unit: '克', daysOffset: -1, frozen: false },
      { tpl: 'beer',     qty: 6, unit: '罐',  daysOffset: 200, frozen: false },
      { tpl: 'icecream', qty: 2, unit: '个',  daysOffset: 30,  frozen: true  }
    ]

    const now = new Date()
    samples.forEach(s => {
      const tpl = INGREDIENTS_DB.find(i => i.id === s.tpl)
      if (!tpl) return
      const expiry = new Date(now.getTime() + s.daysOffset * 24 * 60 * 60 * 1000)
      storage.addItem({
        id: storage.genId(),
        name: tpl.name,
        icon: tpl.icon,
        category: tpl.category,
        categoryName: tpl.categoryName,
        quantity: s.qty,
        unit: s.unit || tpl.defaultUnit,
        expiryDate: expiry.toISOString().slice(0, 10),
        addDate: now.toISOString().slice(0, 10),
        frozen: s.frozen,
        note: '',
        templateId: tpl.id
      })
    })

    const items = storage.getItems()
    this.setData({ totalItems: items.length })
    wx.showToast({ title: '示例数据已添加', icon: 'success' })
  }
})
