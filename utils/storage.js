const FRIDGE_KEY = 'fridge_items'
const SETTINGS_KEY = 'fridge_settings'

const getItems = () => {
  return wx.getStorageSync(FRIDGE_KEY) || []
}

const saveItems = (items) => {
  wx.setStorageSync(FRIDGE_KEY, items)
}

const addItem = (item) => {
  const items = getItems()
  items.push(item)
  saveItems(items)
}

const updateItem = (id, updates) => {
  const items = getItems()
  const idx = items.findIndex(i => i.id === id)
  if (idx !== -1) {
    items[idx] = Object.assign({}, items[idx], updates)
    saveItems(items)
  }
}

const deleteItem = (id) => {
  const items = getItems().filter(i => i.id !== id)
  saveItems(items)
}

const getSettings = () => {
  return wx.getStorageSync(SETTINGS_KEY) || { language: 'en', multiLang: false, extraLang: 'ja', city: '北京' }
}

const saveSettings = (settings) => {
  wx.setStorageSync(SETTINGS_KEY, settings)
}

// 计算距离过期天数
const getDaysUntilExpiry = (expiryDate) => {
  if (!expiryDate) return null
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const expiry = new Date(expiryDate)
  expiry.setHours(0, 0, 0, 0)
  return Math.ceil((expiry - now) / (1000 * 60 * 60 * 24))
}

// 获取保鲜状态: fresh / soon / expired / unknown
const getFreshStatus = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate)
  if (days === null) return 'unknown'
  if (days < 0) return 'expired'
  if (days <= 2) return 'soon'
  return 'fresh'
}

// 格式化过期信息文字
const getExpiryText = (expiryDate) => {
  const days = getDaysUntilExpiry(expiryDate)
  if (days === null) return '未设置'
  if (days < 0) return `已过期 ${Math.abs(days)} 天`
  if (days === 0) return '今天到期！'
  if (days === 1) return '明天到期'
  if (days <= 3) return `还剩 ${days} 天`
  return `${expiryDate}`
}

// 生成唯一ID
const genId = () => `item_${Date.now()}_${Math.floor(Math.random() * 1000)}`

module.exports = {
  getItems,
  saveItems,
  addItem,
  updateItem,
  deleteItem,
  getSettings,
  saveSettings,
  getDaysUntilExpiry,
  getFreshStatus,
  getExpiryText,
  genId
}
