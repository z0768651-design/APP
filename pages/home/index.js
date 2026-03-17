const storage = require('../../utils/storage')

// ===== 经营类游戏 - 状态系统 =====
const GAME_KEY = 'pixel_home_game'
const DOG_KEY = 'pixel_home_dog'
const ALARM_KEY = 'pixel_home_alarm'
const COOK_KEY = 'pixel_home_cook'

// 加载/保存游戏状态
function loadGame() {
  return wx.getStorageSync(GAME_KEY) || {
    energy: 80,      // 精力 0-100
    hunger: 60,      // 饱腹 0-100
    hygiene: 70,     // 清洁 0-100
    mood: 75,        // 心情 0-100
    coins: 100,      // 金币
    exp: 0,          // 经验
    level: 1,        // 等级
    lastTick: Date.now()
  }
}
function saveGame(g) { wx.setStorageSync(GAME_KEY, g) }

function loadDog() {
  return wx.getStorageSync(DOG_KEY) || {
    name: '小黄',
    hunger: 80,
    mood: 70,
    clean: 75,
    tricks: 0,
    lastFed: Date.now(),
    state: 'idle' // idle, happy, eating, sleeping, playing
  }
}
function saveDog(d) { wx.setStorageSync(DOG_KEY, d) }

function loadAlarm() { return wx.getStorageSync(ALARM_KEY) || null }
function saveAlarm(a) { wx.setStorageSync(ALARM_KEY, a) }

// 家具配置：位置 + 真实功能
const FURNITURE_CONFIG = {
  fridge: { x: 60, y: 120, name: '冰箱', panel: 'fridge' },
  stove:  { x: 170, y: 110, name: '灶台', panel: 'cook' },
  sink:   { x: 190, y: 200, name: '水槽', panel: 'sink' },
  cabinet:{ x: 80, y: 240, name: '橱柜', panel: 'cabinet' },
  tv:     { x: 410, y: 100, name: '电视', panel: 'tv' },
  sofa:   { x: 400, y: 190, name: '沙发', panel: 'sofa' },
  table:  { x: 460, y: 195, name: '茶几', panel: 'table' },
  plant:  { x: 540, y: 110, name: '盆栽', panel: 'plant' },
  bed:    { x: 80, y: 430, name: '床', panel: 'bed' },
  wardrobe:{ x: 220, y: 420, name: '衣柜', panel: 'wardrobe' },
  desk:   { x: 80, y: 530, name: '书桌', panel: 'desk' },
  shower: { x: 400, y: 430, name: '淋浴', panel: 'shower' },
  toilet: { x: 520, y: 430, name: '马桶', panel: 'toilet' },
  basin:  { x: 450, y: 530, name: '洗手台', panel: 'basin' },
  door:   { x: 300, y: 580, name: '大门', panel: 'door' },
  dog:    { x: 320, y: 310, name: '小狗', panel: 'dog' }
}

// 菜谱系统
const RECIPES = [
  { name: '番茄炒蛋', cost: 5, hunger: 25, mood: 10, time: 3, emoji: '🍳' },
  { name: '红烧肉', cost: 15, hunger: 40, mood: 20, time: 5, emoji: '🥩' },
  { name: '蔬菜沙拉', cost: 3, hunger: 15, mood: 5, time: 2, emoji: '🥗' },
  { name: '煎饺', cost: 8, hunger: 30, mood: 15, time: 4, emoji: '🥟' }
]

// 电视节目
const TV_SHOWS = [
  { name: '美食纪录片', mood: 15, duration: 5, emoji: '🎬' },
  { name: '搞笑综艺', mood: 25, duration: 8, emoji: '😂' },
  { name: '新闻联播', mood: 5, duration: 3, emoji: '📺' },
  { name: '音乐频道', mood: 20, duration: 6, emoji: '🎵' }
]

Page({
  data: {
    // 食材统计
    totalCount: 0, expiringCount: 0, expiredCount: 0,
    // 时间问候
    greeting: '', timeIcon: '', currentTime: '',
    // 角色
    charX: 260, charY: 310, charWalking: false, charDir: 'down',
    activeFurniture: '',
    // 游戏状态
    energy: 80, hunger: 60, hygiene: 70, mood: 75,
    coins: 100, exp: 0, level: 1,
    // 小狗
    dogName: '小黄', dogHunger: 80, dogMood: 70, dogClean: 75,
    dogState: 'idle', dogTricks: 0,
    dogX: 320, dogY: 340, dogDir: 'right', dogWalking: false,
    showDogBubble: false, dogBubbleText: '',
    // 面板系统
    showPanel: false, panelType: '',
    // 床/闹钟
    alarmSet: false, alarmTime: '', alarmHour: '07', alarmMinute: '00',
    isSleeping: false, sleepCountdown: '',
    // 做饭
    recipes: RECIPES, cookingRecipe: null, cookingProgress: 0, isCooking: false,
    // 电视
    tvShows: TV_SHOWS, tvPlaying: false, tvCurrent: null,
    // 盆栽
    plantWatered: false, plantGrowth: 0,
    // 浴室
    isShowering: false, showerProgress: 0,
    // 书桌
    isStudying: false, studyProgress: 0,
    // 茶几
    hasTea: false,
    // 弹出提示
    showToast: false, toastText: '', toastIcon: ''
  },

  _gameTimer: null,
  _dogTimer: null,
  _clockTimer: null,

  onLoad() {
    this._updateGreeting()
    this._updateClock()
    this.loadStats()
    this._loadGameState()
    this._loadDogState()
    this._startTimers()
    this._checkAlarm()
  },

  onShow() {
    this.loadStats()
    this._updateGreeting()
    this._loadGameState()
    this._loadDogState()
  },

  onUnload() {
    this._stopTimers()
  },

  onHide() {
    this._stopTimers()
  },

  // ===== 时间/问候 =====
  _updateGreeting() {
    const hour = new Date().getHours()
    let greeting, timeIcon
    if (hour < 6) { greeting = '深夜好'; timeIcon = '🌙' }
    else if (hour < 12) { greeting = '早上好'; timeIcon = '🌅' }
    else if (hour < 14) { greeting = '中午好'; timeIcon = '☀️' }
    else if (hour < 18) { greeting = '下午好'; timeIcon = '🌤' }
    else if (hour < 22) { greeting = '晚上好'; timeIcon = '🌆' }
    else { greeting = '夜里好'; timeIcon = '🌛' }
    this.setData({ greeting, timeIcon })
  },

  _updateClock() {
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    this.setData({ currentTime: `${h}:${m}` })
  },

  // ===== 定时器 =====
  _startTimers() {
    this._stopTimers()
    // 每30秒衰减状态
    this._gameTimer = setInterval(() => {
      this._tickGame()
    }, 30000)
    // 小狗AI每10秒
    this._dogTimer = setInterval(() => {
      this._dogAI()
    }, 10000)
    // 时钟每分钟
    this._clockTimer = setInterval(() => {
      this._updateClock()
      this._checkAlarm()
    }, 60000)
  },

  _stopTimers() {
    if (this._gameTimer) { clearInterval(this._gameTimer); this._gameTimer = null }
    if (this._dogTimer) { clearInterval(this._dogTimer); this._dogTimer = null }
    if (this._clockTimer) { clearInterval(this._clockTimer); this._clockTimer = null }
  },

  // ===== 游戏状态 =====
  _loadGameState() {
    const g = loadGame()
    // 计算离线时间衰减
    const elapsed = (Date.now() - g.lastTick) / 60000 // 分钟
    if (elapsed > 1) {
      g.energy = Math.max(0, g.energy - Math.floor(elapsed * 0.1))
      g.hunger = Math.max(0, g.hunger - Math.floor(elapsed * 0.15))
      g.hygiene = Math.max(0, g.hygiene - Math.floor(elapsed * 0.05))
      g.mood = Math.max(0, g.mood - Math.floor(elapsed * 0.08))
      g.lastTick = Date.now()
      saveGame(g)
    }
    this.setData({
      energy: g.energy, hunger: g.hunger, hygiene: g.hygiene, mood: g.mood,
      coins: g.coins, exp: g.exp, level: g.level
    })
  },

  _loadDogState() {
    const d = loadDog()
    const elapsed = (Date.now() - d.lastFed) / 60000
    if (elapsed > 5) {
      d.hunger = Math.max(0, d.hunger - Math.floor(elapsed * 0.1))
      d.mood = Math.max(0, d.mood - Math.floor(elapsed * 0.05))
      d.lastFed = Date.now()
      saveDog(d)
    }
    this.setData({
      dogName: d.name, dogHunger: d.hunger, dogMood: d.mood,
      dogClean: d.clean, dogState: d.state, dogTricks: d.tricks
    })
  },

  _tickGame() {
    const g = loadGame()
    g.energy = Math.max(0, g.energy - 1)
    g.hunger = Math.max(0, g.hunger - 1)
    g.hygiene = Math.max(0, g.hygiene - 1)
    g.mood = Math.max(0, g.mood - 1)
    g.lastTick = Date.now()
    saveGame(g)
    this.setData({
      energy: g.energy, hunger: g.hunger, hygiene: g.hygiene, mood: g.mood
    })
    // 低状态警告
    if (g.hunger <= 15) this._showGameToast('😫', '好饿啊...去做饭吧！')
    else if (g.energy <= 15) this._showGameToast('😴', '好困...去床上休息吧')
    else if (g.hygiene <= 15) this._showGameToast('💦', '该洗澡了...')
  },

  _updateGameState(changes) {
    const g = loadGame()
    for (const k in changes) {
      if (k === 'coins' || k === 'exp') {
        g[k] = Math.max(0, (g[k] || 0) + changes[k])
      } else {
        g[k] = Math.min(100, Math.max(0, (g[k] || 0) + changes[k]))
      }
    }
    // 升级
    const needExp = g.level * 50
    if (g.exp >= needExp) {
      g.exp -= needExp
      g.level++
      this._showGameToast('🎉', `升级到 Lv.${g.level}！`)
    }
    g.lastTick = Date.now()
    saveGame(g)
    this.setData({
      energy: g.energy, hunger: g.hunger, hygiene: g.hygiene, mood: g.mood,
      coins: g.coins, exp: g.exp, level: g.level
    })
  },

  // ===== 小狗AI =====
  _dogAI() {
    const d = loadDog()
    if (d.state === 'sleeping') return

    const actions = ['wander', 'wag', 'sit', 'sniff']
    const action = actions[Math.floor(Math.random() * actions.length)]

    if (action === 'wander') {
      const nx = 200 + Math.floor(Math.random() * 280)
      const ny = 280 + Math.floor(Math.random() * 60)
      const dir = nx > this.data.dogX ? 'right' : 'left'
      this.setData({ dogX: nx, dogY: ny, dogDir: dir, dogWalking: true })
      setTimeout(() => this.setData({ dogWalking: false }), 800)
    } else if (action === 'wag') {
      this._showDogBubble('🐾')
    } else if (action === 'sit') {
      this.setData({ dogState: 'idle' })
    } else if (action === 'sniff') {
      this._showDogBubble('👃')
    }

    // 饿了会叫
    if (d.hunger < 30) {
      this._showDogBubble('🍖?')
    }
  },

  _showDogBubble(text) {
    this.setData({ showDogBubble: true, dogBubbleText: text })
    setTimeout(() => this.setData({ showDogBubble: false }), 2000)
  },

  _updateDogState(changes) {
    const d = loadDog()
    for (const k in changes) {
      d[k] = Math.min(100, Math.max(0, (d[k] || 0) + changes[k]))
    }
    d.lastFed = Date.now()
    saveDog(d)
    this.setData({
      dogHunger: d.hunger, dogMood: d.mood, dogClean: d.clean,
      dogState: d.state || 'idle', dogTricks: d.tricks || 0
    })
  },

  // ===== 食材统计 =====
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

  // ===== 点击家具 =====
  onFurnitureTap(e) {
    const id = e.currentTarget.dataset.id
    const config = FURNITURE_CONFIG[id]
    if (!config) return
    wx.vibrateShort({ type: 'light' })

    const curY = this.data.charY
    const dir = config.y > curY ? 'down' : 'up'
    this.setData({
      charWalking: true, charDir: dir,
      charX: config.x, charY: config.y,
      activeFurniture: id
    })

    setTimeout(() => {
      this.setData({ charWalking: false, activeFurniture: '' })
      this._openPanel(config.panel)
    }, 800)
  },

  // ===== 面板系统 =====
  _openPanel(type) {
    this.setData({ showPanel: true, panelType: type })
  },

  onClosePanel() {
    this.setData({ showPanel: false, panelType: '' })
  },

  // ===== Toast =====
  _showGameToast(icon, text) {
    this.setData({ showToast: true, toastIcon: icon, toastText: text })
    setTimeout(() => this.setData({ showToast: false }), 2500)
  },

  // ===== 冰箱 =====
  onGoFridge() {
    this.setData({ showPanel: false })
    wx.switchTab({ url: '/pages/index/index' })
  },

  // ===== 做饭 =====
  onSelectRecipe(e) {
    const idx = e.currentTarget.dataset.idx
    const recipe = RECIPES[idx]
    const g = loadGame()
    if (g.coins < recipe.cost) {
      this._showGameToast('💸', '金币不够了！')
      return
    }
    this.setData({ cookingRecipe: recipe, isCooking: true, cookingProgress: 0 })
    this._updateGameState({ coins: -recipe.cost })

    let prog = 0
    const timer = setInterval(() => {
      prog += 20
      this.setData({ cookingProgress: prog })
      if (prog >= 100) {
        clearInterval(timer)
        this.setData({ isCooking: false, cookingProgress: 0, cookingRecipe: null })
        this._updateGameState({ hunger: recipe.hunger, mood: recipe.mood, exp: 10 })
        this._showGameToast(recipe.emoji, `${recipe.name}做好了！+${recipe.hunger}饱腹`)
        // 喂小狗一点
        this._updateDogState({ hunger: 5 })
      }
    }, recipe.time * 200)
  },

  // ===== 水槽 =====
  onWashDishes() {
    this._updateGameState({ hygiene: 5, exp: 3 })
    this._showGameToast('💧', '洗完碗了！清洁+5')
    this.setData({ showPanel: false })
  },

  // ===== 橱柜 =====
  onOrganizeCabinet() {
    this._updateGameState({ mood: 5, coins: 3, exp: 5 })
    this._showGameToast('✨', '整理完毕！+3金币')
    this.setData({ showPanel: false })
  },

  // ===== 电视 =====
  onSelectShow(e) {
    const idx = e.currentTarget.dataset.idx
    const show = TV_SHOWS[idx]
    if (this.data.energy < 5) {
      this._showGameToast('😴', '太累了看不了电视...')
      return
    }
    this.setData({ tvPlaying: true, tvCurrent: show })
    setTimeout(() => {
      this.setData({ tvPlaying: false, tvCurrent: null })
      this._updateGameState({ mood: show.mood, energy: -5, exp: 5 })
      this._showGameToast(show.emoji, `看完了！心情+${show.mood}`)
    }, show.duration * 500)
  },

  // ===== 沙发 =====
  onSitSofa() {
    this._updateGameState({ energy: 10, mood: 5 })
    this._showGameToast('😌', '休息一下...精力+10')
    this.setData({ showPanel: false })
  },

  // ===== 茶几 =====
  onMakeTea() {
    if (this.data.coins < 2) {
      this._showGameToast('💸', '金币不够泡茶！')
      return
    }
    this._updateGameState({ coins: -2, mood: 10, energy: 5 })
    this.setData({ hasTea: true })
    this._showGameToast('☕', '泡好一杯热茶！心情+10')
    setTimeout(() => this.setData({ hasTea: false }), 30000)
  },
  onDrinkTea() {
    this.setData({ hasTea: false })
    this._updateGameState({ hunger: 5, mood: 5 })
    this._showGameToast('😊', '喝茶真惬意~')
    this.setData({ showPanel: false })
  },

  // ===== 盆栽 =====
  onWaterPlant() {
    if (this.data.plantWatered) {
      this._showGameToast('🌱', '今天已经浇过水了')
      return
    }
    this.setData({ plantWatered: true, plantGrowth: this.data.plantGrowth + 1 })
    this._updateGameState({ mood: 8, exp: 5, coins: 2 })
    this._showGameToast('🌿', '浇水完成！心情+8 金币+2')
  },

  // ===== 床/闹钟 =====
  onAlarmHourChange(e) {
    this.setData({ alarmHour: e.detail.value })
  },
  onAlarmMinuteChange(e) {
    this.setData({ alarmMinute: e.detail.value })
  },
  onSetAlarm() {
    const t = `${this.data.alarmHour}:${this.data.alarmMinute}`
    saveAlarm({ time: t, enabled: true })
    this.setData({ alarmSet: true, alarmTime: t })
    this._showGameToast('⏰', `闹钟设定：${t}`)
  },
  onCancelAlarm() {
    saveAlarm(null)
    this.setData({ alarmSet: false, alarmTime: '' })
    this._showGameToast('🔕', '闹钟已取消')
  },
  _checkAlarm() {
    const alarm = loadAlarm()
    if (!alarm || !alarm.enabled) return
    const now = new Date()
    const h = String(now.getHours()).padStart(2, '0')
    const m = String(now.getMinutes()).padStart(2, '0')
    if (`${h}:${m}` === alarm.time) {
      wx.vibrateLong()
      this._showGameToast('⏰', '闹钟响了！该起床了！')
      saveAlarm(null)
      this.setData({ alarmSet: false, isSleeping: false })
      this._updateGameState({ energy: 50 })
    }
    this.setData({ alarmSet: alarm.enabled, alarmTime: alarm.time })
  },
  onSleep() {
    this.setData({ isSleeping: true })
    this._updateGameState({ energy: 30 })
    this._showGameToast('💤', '开始睡觉...精力+30')
    let count = 5
    const t = setInterval(() => {
      count--
      this.setData({ sleepCountdown: `${count}s` })
      if (count <= 0) {
        clearInterval(t)
        this.setData({ isSleeping: false, sleepCountdown: '' })
        this._updateGameState({ energy: 20 })
        this._showGameToast('🌅', '睡醒了！精力又恢复了一些')
      }
    }, 1000)
  },

  // ===== 衣柜 =====
  onChangeClothes() {
    this._updateGameState({ mood: 10, hygiene: 5, exp: 3 })
    this._showGameToast('👔', '换了新衣服！心情+10')
    this.setData({ showPanel: false })
  },

  // ===== 书桌 =====
  onStudy() {
    if (this.data.energy < 10) {
      this._showGameToast('😴', '太累了学不进去...')
      return
    }
    this.setData({ isStudying: true, studyProgress: 0 })
    let prog = 0
    const t = setInterval(() => {
      prog += 10
      this.setData({ studyProgress: prog })
      if (prog >= 100) {
        clearInterval(t)
        this.setData({ isStudying: false, studyProgress: 0 })
        this._updateGameState({ energy: -15, mood: 5, exp: 20, coins: 10 })
        this._showGameToast('📚', '学习完成！+20经验 +10金币')
      }
    }, 800)
  },

  // ===== 淋浴 =====
  onShower() {
    this.setData({ isShowering: true, showerProgress: 0 })
    let prog = 0
    const t = setInterval(() => {
      prog += 15
      this.setData({ showerProgress: prog })
      if (prog >= 100) {
        clearInterval(t)
        this.setData({ isShowering: false, showerProgress: 0 })
        this._updateGameState({ hygiene: 40, mood: 10, energy: -5, exp: 5 })
        this._showGameToast('🚿', '洗完澡了！清洁+40')
        this.setData({ showPanel: false })
      }
    }, 600)
  },

  // ===== 马桶 =====
  onUseToilet() {
    this._updateGameState({ hygiene: -5, mood: 3, exp: 1 })
    this._showGameToast('🚽', '...舒服了')
    this.setData({ showPanel: false })
  },

  // ===== 洗手台 =====
  onWashHands() {
    this._updateGameState({ hygiene: 10, exp: 2 })
    this._showGameToast('🧼', '手洗干净了！清洁+10')
    this.setData({ showPanel: false })
  },
  onBrushTeeth() {
    this._updateGameState({ hygiene: 15, mood: 5, exp: 3 })
    this._showGameToast('🪥', '刷完牙齿！清洁+15')
    this.setData({ showPanel: false })
  },

  // ===== 大门 =====
  onGoOut() {
    if (this.data.energy < 20) {
      this._showGameToast('😫', '太累了出不了门...')
      return
    }
    this._updateGameState({ energy: -20, coins: 15, exp: 15, mood: 10 })
    this._showGameToast('🚶', '出门逛了一圈！+15金币 +10心情')
    this.setData({ showPanel: false })
  },

  // ===== 小狗互动 =====
  onFeedDog() {
    if (this.data.coins < 5) {
      this._showGameToast('💸', '金币不够买狗粮！')
      return
    }
    this._updateGameState({ coins: -5 })
    this._updateDogState({ hunger: 30 })
    const d = loadDog()
    d.state = 'eating'
    d.lastFed = Date.now()
    saveDog(d)
    this.setData({ dogState: 'eating' })
    this._showDogBubble('😋')
    this._showGameToast('🍖', `喂${this.data.dogName}吃饭！`)
    setTimeout(() => {
      const d2 = loadDog()
      d2.state = 'idle'
      saveDog(d2)
      this.setData({ dogState: 'idle' })
    }, 3000)
  },
  onPetDog() {
    this._updateDogState({ mood: 15 })
    this._updateGameState({ mood: 10 })
    this.setData({ dogState: 'happy' })
    this._showDogBubble('❤️')
    this._showGameToast('🐕', `摸摸${this.data.dogName}！心情+10`)
    setTimeout(() => this.setData({ dogState: 'idle' }), 2000)
  },
  onPlayDog() {
    if (this.data.energy < 10) {
      this._showGameToast('😴', '太累了没力气玩...')
      return
    }
    this._updateGameState({ energy: -10, mood: 15, exp: 5 })
    this._updateDogState({ mood: 20, hunger: -10 })
    const d = loadDog()
    d.tricks = (d.tricks || 0) + 1
    d.state = 'playing'
    saveDog(d)
    this.setData({ dogState: 'playing', dogTricks: d.tricks })
    this._showDogBubble('🎾')
    this._showGameToast('🎾', `和${this.data.dogName}玩耍！互动${d.tricks}次`)
    setTimeout(() => {
      const d2 = loadDog()
      d2.state = 'idle'
      saveDog(d2)
      this.setData({ dogState: 'idle' })
    }, 3000)
  },
  onWashDog() {
    this._updateDogState({ clean: 30, mood: -5 })
    this._updateGameState({ hygiene: -5, exp: 5 })
    this._showDogBubble('🫧')
    this._showGameToast('🛁', `给${this.data.dogName}洗澡！`)
  }
})
