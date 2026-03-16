const storage = require('../../utils/storage')
const { INGREDIENTS_DB, CATEGORIES } = require('../../utils/ingredients')

Page({
  data: {
    // 搜索
    searchKeyword: '',
    searchResults: [],
    showSearch: true,
    // 选中的食材模板
    selectedTemplate: null,
    // 表单数据
    form: {
      name: '',
      icon: '🍽',
      category: 'vegetable',
      categoryName: '蔬菜',
      quantity: 1,
      unit: '个',
      expiryDate: '',
      frozen: false,
      note: ''
    },
    categories: CATEGORIES.filter(c => c.id !== 'all'),
    // 日期范围
    minDate: '',
    maxDate: '',
    units: ['个', '克', '千克', '根', '块', '袋', '瓶', '盒', '罐', '片', '条', '头', '棵', '把', '串', '只', '包']
  },

  onLoad() {
    const now = new Date()
    const minDate = now.toISOString().slice(0, 10)
    const maxDate = new Date(now.getFullYear() + 2, 0, 1).toISOString().slice(0, 10)
    // 默认过期日期7天后
    const defaultExpiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
    this.setData({
      minDate,
      maxDate,
      'form.expiryDate': defaultExpiry
    })
    this.doSearch('')
  },

  onShow() {
    this.doSearch(this.data.searchKeyword)
  },

  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    this.doSearch(keyword)
  },

  doSearch(keyword) {
    const results = keyword
      ? INGREDIENTS_DB.filter(i =>
          i.name.includes(keyword) ||
          Object.values(i.translations).some(t => t.name.toLowerCase().includes(keyword.toLowerCase()))
        )
      : INGREDIENTS_DB
    this.setData({ searchResults: results.slice(0, 30) })
  },

  onTemplateTap(e) {
    const { id } = e.currentTarget.dataset
    const tpl = INGREDIENTS_DB.find(i => i.id === id)
    if (!tpl) return

    const now = new Date()
    const defaultExpiry = new Date(now.getTime() + tpl.defaultShelfDays * 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10)

    this.setData({
      selectedTemplate: tpl,
      showSearch: false,
      'form.name': tpl.name,
      'form.icon': tpl.icon,
      'form.category': tpl.category,
      'form.categoryName': tpl.categoryName,
      'form.unit': tpl.defaultUnit,
      'form.expiryDate': defaultExpiry,
      'form.quantity': 1
    })
  },

  onBackToSearch() {
    this.setData({ showSearch: true, selectedTemplate: null })
  },

  onDecQty() {
    const q = Math.max(1, this.data.form.quantity - 1)
    this.setData({ 'form.quantity': q })
  },

  onIncQty() {
    this.setData({ 'form.quantity': this.data.form.quantity + 1 })
  },

  onQuantityChange(e) {
    this.setData({ 'form.quantity': parseInt(e.detail.value) || 1 })
  },

  onUnitChange(e) {
    const units = this.data.units
    this.setData({ 'form.unit': units[e.detail.value] })
  },

  onDateChange(e) {
    this.setData({ 'form.expiryDate': e.detail.value })
  },

  onFrozenChange(e) {
    this.setData({ 'form.frozen': e.detail.value })
  },

  onNoteInput(e) {
    this.setData({ 'form.note': e.detail.value })
  },

  onSubmit() {
    const { form } = this.data
    if (!form.name) {
      wx.showToast({ title: '请选择或输入食材', icon: 'none' })
      return
    }

    const item = {
      ...form,
      id: storage.genId(),
      addDate: new Date().toISOString().slice(0, 10),
      templateId: this.data.selectedTemplate ? this.data.selectedTemplate.id : null
    }

    storage.addItem(item)
    wx.showToast({ title: '已添加到冰箱！', icon: 'success' })

    // 重置
    setTimeout(() => {
      this.setData({
        showSearch: true,
        selectedTemplate: null,
        searchKeyword: '',
        'form.note': '',
        'form.quantity': 1
      })
      this.doSearch('')
      wx.switchTab({ url: '/pages/index/index' })
    }, 800)
  }
})
