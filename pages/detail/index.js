const storage = require('../../utils/storage')
const { INGREDIENTS_DB, LANGUAGES } = require('../../utils/ingredients')

Page({
  data: {
    item: null,
    template: null,
    settings: null,
    languages: LANGUAGES,
    currentLang: 'en',
    currentLangInfo: null,
    translation: null,
    speaking: false,
    // 编辑模式
    editing: false,
    editQty: 1,
    editExpiry: ''
  },

  onLoad(options) {
    const { id } = options
    this.loadItem(id)
  },

  onShow() {
    const item = this.data.item
    if (item) this.loadItem(item.id)
  },

  loadItem(id) {
    const items = storage.getItems()
    const item = items.find(i => i.id === id)
    if (!item) {
      wx.showToast({ title: '食材不存在', icon: 'none' })
      wx.navigateBack()
      return
    }

    const settings = storage.getSettings()
    const template = item.templateId ? INGREDIENTS_DB.find(t => t.id === item.templateId) : null
    const enriched = {
      ...item,
      status: storage.getFreshStatus(item.expiryDate),
      expiryText: storage.getExpiryText(item.expiryDate),
      daysLeft: storage.getDaysUntilExpiry(item.expiryDate)
    }

    const currentLang = settings.language || 'en'
    const langInfo = LANGUAGES.find(l => l.id === currentLang) || LANGUAGES[0]
    const translation = template ? template.translations[currentLang] : null

    this.setData({
      item: enriched,
      template,
      settings,
      currentLang,
      currentLangInfo: langInfo,
      translation,
      editQty: enriched.quantity,
      editExpiry: enriched.expiryDate || ''
    })
  },

  onLangSwitch(e) {
    const { id } = e.currentTarget.dataset
    const { template } = this.data
    const langInfo = LANGUAGES.find(l => l.id === id)
    const translation = template ? template.translations[id] : null

    storage.saveSettings({ ...this.data.settings, language: id })
    this.setData({
      currentLang: id,
      currentLangInfo: langInfo,
      translation,
      settings: { ...this.data.settings, language: id }
    })
  },

  onSpeak() {
    const { translation, currentLangInfo, item } = this.data
    if (!translation && !item) return

    const textToSpeak = translation ? translation.name : item.name
    const lang = currentLangInfo ? currentLangInfo.ttsLang : 'zh_CN'

    this.setData({ speaking: true })

    wx.textToSpeech({
      lang,
      volume: 1,
      rate: 0.8,
      text: textToSpeak,
      success: (res) => {
        const audioCtx = wx.createInnerAudioContext()
        audioCtx.src = res.filename
        audioCtx.play()
        audioCtx.onEnded(() => {
          this.setData({ speaking: false })
          audioCtx.destroy()
        })
        audioCtx.onError(() => {
          this.setData({ speaking: false })
          audioCtx.destroy()
        })
      },
      fail: () => {
        this.setData({ speaking: false })
        wx.showToast({ title: '语音功能暂不可用', icon: 'none' })
      }
    })
  },

  onSpeakChinese() {
    const { item } = this.data
    this.setData({ speaking: true })
    wx.textToSpeech({
      lang: 'zh_CN',
      volume: 1,
      rate: 0.8,
      text: item.name,
      success: (res) => {
        const audioCtx = wx.createInnerAudioContext()
        audioCtx.src = res.filename
        audioCtx.play()
        audioCtx.onEnded(() => {
          this.setData({ speaking: false })
          audioCtx.destroy()
        })
      },
      fail: () => {
        this.setData({ speaking: false })
        wx.showToast({ title: '语音不可用', icon: 'none' })
      }
    })
  },

  toggleEdit() {
    this.setData({ editing: !this.data.editing })
  },

  onEditQty(e) {
    this.setData({ editQty: parseInt(e.detail.value) || 1 })
  },

  onEditExpiry(e) {
    this.setData({ editExpiry: e.detail.value })
  },

  onToggleFrozen() {
    const { item } = this.data
    storage.updateItem(item.id, { frozen: !item.frozen })
    this.loadItem(item.id)
  },

  onSaveEdit() {
    const { item, editQty, editExpiry } = this.data
    storage.updateItem(item.id, { quantity: editQty, expiryDate: editExpiry })
    this.setData({ editing: false })
    this.loadItem(item.id)
    wx.showToast({ title: '已更新', icon: 'success' })
  },

  onDelete() {
    const { item } = this.data
    wx.showModal({
      title: '移除食材',
      content: `确定移除「${item.name}」？`,
      confirmColor: '#ff5252',
      success: (res) => {
        if (res.confirm) {
          storage.deleteItem(item.id)
          wx.navigateBack()
          wx.showToast({ title: '已移除', icon: 'success' })
        }
      }
    })
  }
})
