App({
  onLaunch() {
    const storage = require('./utils/storage')
    const settings = storage.getSettings()
    if (!settings.language) {
      storage.saveSettings({ language: 'en', multiLang: false, extraLang: 'ja' })
    }
  },
  globalData: {}
})
