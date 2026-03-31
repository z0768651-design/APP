const storage = require('../../utils/storage')

// ===== 存储键 =====
const GAME_KEY = 'pixel_home_game_v2'
const DOG_KEY = 'pixel_home_dog'
const ALARM_KEY = 'pixel_home_alarm'
const GF_KEY = 'pixel_home_gf'

// ===== 智能食谱 (基于冰箱食材，菜谱真实准确) =====
const SMART_RECIPES = [
  {
    name: '番茄炒鸡蛋', emoji: '🍳', diff: '简单',
    ingredients: ['番茄', '鸡蛋'],
    steps: ['鸡蛋2个打散，加少许盐搅匀', '番茄2个去皮切块', '热锅宽油，倒入蛋液炒至七成熟盛出', '锅中留底油，放番茄块翻炒出汁', '倒回鸡蛋，加1勺糖、适量盐翻炒均匀', '出锅装盘'],
    time: 3, cost: 5, energy: 25, mood: 12
  },
  {
    name: '红烧肉', emoji: '🥩', diff: '中等',
    ingredients: ['猪肉'],
    steps: ['五花肉切3cm方块，冷水下锅焯水2分钟捞出', '锅中放少许油，加2勺冰糖小火炒至琥珀色', '放入肉块翻炒上色', '加2勺生抽、1勺老抽、1勺料酒', '加热水没过肉，大火烧开', '转小火盖盖炖45分钟', '开盖大火收汁即可'],
    time: 6, cost: 15, energy: 40, mood: 22
  },
  {
    name: '土豆炖鸡', emoji: '🍗', diff: '中等',
    ingredients: ['土豆', '鸡肉'],
    steps: ['鸡肉切块用盐、料酒腌10分钟', '土豆去皮切滚刀块', '热锅下油，放姜蒜爆香', '鸡块入锅煎至两面金黄', '加酱油、老抽各1勺翻炒', '放入土豆，加热水没过食材', '中火炖25分钟至汤汁浓稠'],
    time: 5, cost: 12, energy: 35, mood: 18
  },
  {
    name: '蒜蓉炒西兰花', emoji: '🥦', diff: '简单',
    ingredients: ['西兰花', '大蒜'],
    steps: ['西兰花掰小朵，加盐焯水30秒捞出', '大蒜4瓣切末', '热锅下油，爆香蒜末', '放入西兰花大火翻炒2分钟', '加盐、少许生抽调味出锅'],
    time: 2, cost: 4, energy: 15, mood: 8
  },
  {
    name: '番茄牛肉汤', emoji: '🍲', diff: '中等',
    ingredients: ['番茄', '牛肉'],
    steps: ['牛肉切块冷水焯去血沫', '番茄2个切块', '锅中放油，炒番茄至出汁', '加入牛肉块翻炒', '加热水大火烧开', '转中火炖30分钟', '加盐、少许白糖调味即可'],
    time: 5, cost: 18, energy: 38, mood: 22
  },
  {
    name: '清蒸鱼', emoji: '🐟', diff: '简单',
    ingredients: ['鱼'],
    steps: ['鱼处理干净，鱼身两面各划三刀', '鱼腹塞姜片，鱼身抹少许盐腌10分钟', '蒸锅水烧开，放入鱼', '大火蒸8分钟后关火虚蒸2分钟', '倒掉蒸出的汤汁，鱼上铺葱丝姜丝', '起油锅烧至冒烟，淋在葱姜上', '最后淋2勺蒸鱼豉油即可'],
    time: 3, cost: 10, energy: 30, mood: 15
  },
  {
    name: '虾仁炒蛋', emoji: '🦐', diff: '简单',
    ingredients: ['虾', '鸡蛋'],
    steps: ['鲜虾去壳去虾线，加盐和料酒腌5分钟', '鸡蛋3个打散加少许盐', '热锅宽油，倒蛋液炒至嫩滑盛出', '锅中再放油，虾仁入锅翻炒至变色', '倒回鸡蛋翻炒均匀', '加少许盐和葱花出锅'],
    time: 3, cost: 12, energy: 28, mood: 14
  },
  {
    name: '煎培根蛋', emoji: '🥓', diff: '简单',
    ingredients: ['培根', '鸡蛋'],
    steps: ['平底锅不放油，培根片中小火煎', '煎至两面微焦盛出', '利用培根出的油，打入鸡蛋', '煎至蛋白凝固、蛋黄半熟', '撒黑胡椒和少许盐调味', '与培根一起装盘'],
    time: 2, cost: 8, energy: 22, mood: 16
  },
  {
    name: '胡萝卜炒肉丝', emoji: '🥕', diff: '简单',
    ingredients: ['胡萝卜', '猪肉'],
    steps: ['猪肉切丝，加盐、淀粉、料酒腌10分钟', '胡萝卜去皮切丝', '热锅下油，大火炒肉丝至变色盛出', '锅中放油，翻炒胡萝卜丝2分钟', '倒回肉丝一起翻炒', '加盐调味出锅'],
    time: 3, cost: 8, energy: 28, mood: 10
  },
  {
    name: '玉米排骨汤', emoji: '🌽', diff: '简单',
    ingredients: ['玉米', '猪肉'],
    steps: ['排骨冷水下锅焯水，撇去浮沫', '玉米切段', '砂锅加排骨、玉米和足量冷水', '大火烧开后转小火', '炖40分钟至排骨软烂', '出锅前加盐调味即可'],
    time: 6, cost: 14, energy: 36, mood: 20
  },
  {
    name: '蔬菜沙拉', emoji: '🥗', diff: '简单',
    ingredients: [], anyVeg: true,
    steps: ['各类蔬菜洗净，叶菜撕小片，根菜切薄片', '黄瓜、番茄等切丁或切片', '所有蔬菜放入大碗', '淋上橄榄油和柠檬汁', '撒盐和黑胡椒拌匀即可'],
    time: 1, cost: 3, energy: 12, mood: 6
  },
  {
    name: '葱花炒蛋', emoji: '🍳', diff: '简单',
    ingredients: ['鸡蛋'],
    steps: ['鸡蛋3个打散', '加切碎的葱花、少许盐搅匀', '热锅多放油烧至七成热', '蛋液入锅，用筷子快速划散', '蛋液半凝固时翻炒几下', '嫩滑即出锅，不要炒过'],
    time: 2, cost: 4, energy: 18, mood: 10
  }
]

// ===== 女朋友对话（每种语气8条不重复） =====
const GF_RESPONSES = {
  sweet: [
    { text: '你来陪我啦！等你好久了呢 💕', mood: 20 },
    { text: '在你身边感觉好幸福~ 让我抱一下嘛 🥺', mood: 22 },
    { text: '你今天看起来特别帅呢！怎么做到的？', mood: 18 },
    { text: '我偷偷给你留了甜点，快来吃～ 🍰', mood: 25 },
    { text: '和你在一起，每天都好开心呀 💖', mood: 20 },
    { text: '你是我最喜欢的人，没有之一哦~', mood: 24 },
    { text: '刚才在想你，你就出现了，好神奇✨', mood: 22 },
    { text: '能认识你真的太好了，每天都很幸福 💗', mood: 28 }
  ],
  playful: [
    { text: '哼~ 你才来！罚你给我讲三个笑话！😏', mood: 15 },
    { text: '猜猜我在想什么？哈哈猜不到吧！🤭', mood: 18 },
    { text: '你是不是又在偷懒？我可都看到了！👀', mood: 14 },
    { text: '本小姐今天心情超好！要不要比赛？😄', mood: 20 },
    { text: '嘿嘿我藏了个东西，你来找找看？😈', mood: 16 },
    { text: '你的表情好搞笑哦~ 不过挺可爱的！', mood: 17 },
    { text: '想到一个超冷的笑话，你要不要听？😜', mood: 19 },
    { text: '抓到你发呆了！是在想我对不对！🫵', mood: 21 }
  ],
  caring: [
    { text: '你今天累不累？快坐下，我帮你揉揉肩💆', mood: 18 },
    { text: '记得多喝水哦，别让自己太累了 🥤', mood: 15 },
    { text: '吃饭了吗？没吃的话我帮你热一下饭菜', mood: 20 },
    { text: '今天降温了，出门记得多穿一点哦🧥', mood: 16 },
    { text: '工作别太拼了，身体最重要！我心疼你', mood: 14 },
    { text: '你看起来有点疲惫，要先休息一下吗？', mood: 18 },
    { text: '睡眠要充足哦，不然第二天会没精神的🌙', mood: 16 },
    { text: '别一直盯屏幕了，偶尔看看远处放松眼睛👁️', mood: 17 }
  ]
}

// ===== 新闻标题池 =====
const NEWS_POOL = [
  { title: '国内GDP增速符合预期，经济发展势头良好', source: '新华社' },
  { title: '新能源汽车出口量持续增长创历史新高', source: '人民日报' },
  { title: 'AI大模型迎来新突破，多项能力显著提升', source: '科技日报' },
  { title: '今年夏季气候预测：全国大部分地区偏暖', source: '央视新闻' },
  { title: '国家推出系列政策支持住房消费市场', source: '财经网' },
  { title: '医学研究：规律运动可有效降低疾病风险', source: '健康时报' },
  { title: '城市出行数据分析：骑行通勤比例持续上升', source: '澎湃新闻' },
  { title: '文旅部：假期旅游市场持续火热多地爆满', source: '中国旅游报' },
  { title: '量子计算领域重大进展，实用化进程加速', source: '中国科学报' },
  { title: '多地开展无废城市建设，垃圾分类成效显著', source: '光明日报' },
  { title: '平均气温记录刷新，专家呼吁关注气候变化', source: '环境时报' },
  { title: '国内消费市场加速恢复，零售总额稳步增长', source: '经济日报' }
]

// ===== 天气模拟 =====
function getMockWeather(city) {
  const month = new Date().getMonth() + 1
  let tempBase = 20
  if (month <= 2 || month === 12) tempBase = 3
  else if (month <= 4) tempBase = 15
  else if (month >= 6 && month <= 8) tempBase = 31
  else if (month >= 9 && month <= 10) tempBase = 20
  else tempBase = 10

  const seed = (city || '').split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const conditions = [
    { label: '晴', icon: '☀️', advice: '天气不错，适合出门散步！' },
    { label: '多云', icon: '⛅', advice: '天空有云，出行无碍。' },
    { label: '小雨', icon: '🌧️', advice: '出门记得带伞哦~' },
    { label: '阴', icon: '☁️', advice: '天色有些阴沉，注意心情。' },
    { label: '晴转多云', icon: '🌤️', advice: '气温适宜，享受好天气吧！' }
  ]
  const w = conditions[seed % conditions.length]
  const temp = tempBase + (seed % 6) - 2

  return {
    city: city || '未设置',
    temp: temp,
    tempLow: temp - 5 - (seed % 3),
    condition: w.label,
    icon: w.icon,
    humidity: 40 + (seed % 40),
    advice: w.advice
  }
}

// ===== 存储辅助 =====
function loadGame() {
  return wx.getStorageSync(GAME_KEY) || {
    energy: 80, mood: 75,
    coins: 100, exp: 0, level: 1,
    lastTick: Date.now()
  }
}
function saveGame(g) { wx.setStorageSync(GAME_KEY, g) }

function loadDog() {
  return wx.getStorageSync(DOG_KEY) || {
    name: '小黄', hunger: 80, mood: 70, clean: 75,
    tricks: 0, lastFed: Date.now(), state: 'idle'
  }
}
function saveDog(d) { wx.setStorageSync(DOG_KEY, d) }

function loadAlarm() { return wx.getStorageSync(ALARM_KEY) || null }
function saveAlarm(a) { wx.setStorageSync(ALARM_KEY, a) }

function loadGF() {
  return wx.getStorageSync(GF_KEY) || {
    mood: 80, level: 1, interactCount: 0,
    lastIdx: { sweet: -1, playful: -1, caring: -1 }
  }
}
function saveGF(gf) { wx.setStorageSync(GF_KEY, gf) }

// 家具配置
const FURNITURE_CONFIG = {
  fridge:     { x: 60,  y: 100, name: '冰箱', panel: 'fridge' },
  stove:      { x: 160, y: 100, name: '灶台', panel: 'cook' },
  sink:       { x: 180, y: 190, name: '水槽', panel: 'sink' },
  cabinet:    { x: 70,  y: 220, name: '橱柜', panel: 'cabinet' },
  tv:         { x: 400, y: 90,  name: '电视', panel: 'tv' },
  sofa:       { x: 400, y: 180, name: '沙发', panel: 'sofa' },
  table:      { x: 490, y: 180, name: '茶几', panel: 'table' },
  plant:      { x: 560, y: 90,  name: '盆栽', panel: 'plant' },
  bed:        { x: 80,  y: 430, name: '床',   panel: 'bed' },
  wardrobe:   { x: 200, y: 420, name: '衣柜', panel: 'wardrobe' },
  desk:       { x: 80,  y: 530, name: '书桌', panel: 'desk' },
  girlfriend: { x: 260, y: 520, name: '女友', panel: 'girlfriend' },
  shower:     { x: 430, y: 430, name: '淋浴', panel: 'shower' },
  toilet:     { x: 540, y: 430, name: '马桶', panel: 'toilet' },
  basin:      { x: 480, y: 530, name: '洗手台', panel: 'basin' },
  door:       { x: 300, y: 600, name: '大门', panel: 'door' },
  dog:        { x: 330, y: 330, name: '小狗', panel: 'dog' }
}

Page({
  data: {
    // 食材统计
    totalCount: 0, expiringCount: 0, expiredCount: 0,
    // 时间问候
    greeting: '', timeIcon: '', currentTime: '',
    // 角色
    charX: 280, charY: 330, charWalking: false, charDir: 'down',
    activeFurniture: '',
    // 游戏状态 (仅体力+心情)
    energy: 80, mood: 75,
    coins: 100, exp: 0, level: 1,
    // 小狗
    dogName: '小黄', dogHunger: 80, dogMood: 70, dogClean: 75,
    dogState: 'idle', dogTricks: 0,
    dogX: 330, dogY: 340, dogDir: 'right', dogWalking: false,
    showDogBubble: false, dogBubbleText: '',
    // 面板系统
    showPanel: false, panelType: '',
    // 闹钟/床
    alarmSet: false, alarmTime: '', alarmHour: '07', alarmMinute: '00',
    isSleeping: false, sleepCountdown: '',
    // 智能菜谱
    smartRecipes: [], cookingRecipe: null, cookingProgress: 0, isCooking: false,
    showRecipeSteps: false, currentRecipeSteps: [],
    // 电视/新闻
    tvPlaying: false, tvNews: [], tvLoadingNews: false, showTvNews: false,
    // 盆栽
    plantWatered: false, plantGrowth: 0,
    // 淋浴
    isShowering: false, showerProgress: 0,
    // 书桌
    isStudying: false, studyProgress: 0, studySubMode: 'study',
    // 外语学习
    langCards: [], currentCardIdx: 0, cardFlipped: false,
    langName: '英语', langCode: 'en',
    // 茶
    hasTea: false,
    // 天气
    weather: null, showWeather: false,
    // 女朋友
    gfTone: 'sweet', gfResponse: '',
    gfLevel: 1, gfMood: 80, gfInteractCount: 0,
    showGFBubble: false, gfBubbleText: '❤️',
    // 提示
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
    this._loadGFState()
    this._startTimers()
    this._checkAlarm()
    this._loadLangSetting()
  },

  onShow() {
    this.loadStats()
    this._updateGreeting()
    this._loadGameState()
    this._loadDogState()
    this._loadGFState()
    this._loadLangSetting()
  },

  onUnload() { this._stopTimers() },
  onHide() { this._stopTimers() },

  _loadLangSetting() {
    const settings = storage.getSettings()
    const langMap = { en: '英语', ja: '日语', ko: '韩语', fr: '法语', es: '西语', de: '德语' }
    this.setData({
      langCode: settings.language || 'en',
      langName: langMap[settings.language] || '英语'
    })
  },

  // ===== 时间/问候 =====
  _updateGreeting() {
    const h = new Date().getHours()
    let greeting, timeIcon
    if (h < 6) { greeting = '深夜好'; timeIcon = '🌙' }
    else if (h < 12) { greeting = '早上好'; timeIcon = '🌅' }
    else if (h < 14) { greeting = '中午好'; timeIcon = '☀️' }
    else if (h < 18) { greeting = '下午好'; timeIcon = '🌤' }
    else if (h < 22) { greeting = '晚上好'; timeIcon = '🌆' }
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
    this._gameTimer = setInterval(() => this._tickGame(), 60000)
    this._dogTimer = setInterval(() => this._dogAI(), 10000)
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

  // ===== 游戏状态（仅体力+心情） =====
  _loadGameState() {
    const g = loadGame()
    const elapsed = (Date.now() - g.lastTick) / 60000
    if (elapsed > 1) {
      g.energy = Math.max(0, g.energy - Math.floor(elapsed * 0.12))
      g.mood = Math.max(0, g.mood - Math.floor(elapsed * 0.08))
      g.lastTick = Date.now()
      saveGame(g)
    }
    this.setData({ energy: g.energy, mood: g.mood, coins: g.coins, exp: g.exp, level: g.level })
  },

  _loadDogState() {
    const d = loadDog()
    const elapsed = (Date.now() - d.lastFed) / 60000
    if (elapsed > 5) {
      d.hunger = Math.max(0, d.hunger - Math.floor(elapsed * 0.1))
      d.lastFed = Date.now()
      saveDog(d)
    }
    this.setData({
      dogName: d.name, dogHunger: d.hunger, dogMood: d.mood,
      dogClean: d.clean, dogState: d.state, dogTricks: d.tricks
    })
  },

  _loadGFState() {
    const gf = loadGF()
    this.setData({ gfLevel: gf.level, gfMood: gf.mood, gfInteractCount: gf.interactCount })
  },

  _tickGame() {
    const g = loadGame()
    g.energy = Math.max(0, g.energy - 1)
    g.mood = Math.max(0, g.mood - 1)
    g.lastTick = Date.now()
    saveGame(g)
    this.setData({ energy: g.energy, mood: g.mood })
    if (g.energy <= 15) this._showGameToast('😴', '体力不足了，快去休息吧！')
    else if (g.mood <= 15) this._showGameToast('😢', '心情低落，去找女友聊聊？')
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
    const needExp = g.level * 50
    if (g.exp >= needExp) {
      g.exp -= needExp
      g.level++
      this._showGameToast('🎉', `升级到 Lv.${g.level}！`)
    }
    g.lastTick = Date.now()
    saveGame(g)
    this.setData({ energy: g.energy, mood: g.mood, coins: g.coins, exp: g.exp, level: g.level })
  },

  // ===== 小狗AI =====
  _dogAI() {
    const d = loadDog()
    if (d.state === 'sleeping') return
    const actions = ['wander', 'wag', 'sit', 'sniff']
    const action = actions[Math.floor(Math.random() * actions.length)]
    if (action === 'wander') {
      const nx = 220 + Math.floor(Math.random() * 200)
      const ny = 300 + Math.floor(Math.random() * 50)
      this.setData({ dogX: nx, dogY: ny, dogDir: nx > this.data.dogX ? 'right' : 'left', dogWalking: true })
      setTimeout(() => this.setData({ dogWalking: false }), 800)
    } else if (action === 'wag') {
      this._showDogBubble('🐾')
    } else if (action === 'sniff') {
      this._showDogBubble('👃')
    }
    if (d.hunger < 30) this._showDogBubble('🍖?')
  },

  _showDogBubble(text) {
    this.setData({ showDogBubble: true, dogBubbleText: text })
    setTimeout(() => this.setData({ showDogBubble: false }), 2000)
  },

  _updateDogState(changes) {
    const d = loadDog()
    for (const k in changes) {
      if (typeof d[k] === 'number') {
        d[k] = Math.min(100, Math.max(0, d[k] + changes[k]))
      } else {
        d[k] = changes[k]
      }
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
    const enriched = items.map(i => ({ ...i, status: storage.getFreshStatus(i.expiryDate) }))
    this.setData({
      totalCount: enriched.length,
      expiringCount: enriched.filter(i => i.status === 'soon').length,
      expiredCount: enriched.filter(i => i.status === 'expired').length
    })
  },

  // ===== 家具点击 =====
  onFurnitureTap(e) {
    const id = e.currentTarget.dataset.id
    const config = FURNITURE_CONFIG[id]
    if (!config) return
    wx.vibrateShort({ type: 'light' })
    this.setData({
      charWalking: true,
      charDir: config.y > this.data.charY ? 'down' : 'up',
      charX: config.x, charY: config.y,
      activeFurniture: id
    })
    setTimeout(() => {
      this.setData({ charWalking: false, activeFurniture: '' })
      this._openPanel(config.panel)
    }, 800)
  },

  _openPanel(type) {
    if (type === 'cook') this._buildSmartRecipes()
    if (type === 'desk') this._buildLangCards()
    this.setData({ showPanel: true, panelType: type, showRecipeSteps: false })
  },

  onClosePanel() {
    this.setData({
      showPanel: false, panelType: '',
      showRecipeSteps: false, studySubMode: 'study',
      cardFlipped: false, showTvNews: false, tvPlaying: false
    })
  },

  _showGameToast(icon, text) {
    this.setData({ showToast: true, toastIcon: icon, toastText: text })
    setTimeout(() => this.setData({ showToast: false }), 2500)
  },

  // ===== 冰箱（修复导航） =====
  onGoFridge() {
    this.setData({ showPanel: false })
    wx.navigateTo({ url: '/pages/index/index' })
  },

  // ===== 智能菜谱系统 =====
  _buildSmartRecipes() {
    const items = storage.getItems()
    const names = items.filter(i => storage.getFreshStatus(i.expiryDate) !== 'expired').map(i => i.name)

    const recipes = SMART_RECIPES.map(recipe => {
      let canMake = false
      if (recipe.anyVeg) {
        canMake = names.length > 0
      } else {
        canMake = recipe.ingredients.every(ing =>
          names.some(n => n.includes(ing) || ing.includes(n))
        )
      }
      return { ...recipe, canMake }
    })
    recipes.sort((a, b) => (b.canMake ? 1 : 0) - (a.canMake ? 1 : 0))
    this.setData({ smartRecipes: recipes })
  },

  onSelectSmartRecipe(e) {
    const idx = e.currentTarget.dataset.idx
    const recipe = this.data.smartRecipes[idx]
    if (!recipe) return
    if (!recipe.canMake) {
      this._showGameToast('🛒', `缺少食材：${recipe.ingredients.join('、')}`)
      return
    }
    const g = loadGame()
    if (g.coins < recipe.cost) {
      this._showGameToast('💸', '金币不够了！')
      return
    }
    this.setData({
      showRecipeSteps: true,
      currentRecipeSteps: recipe.steps,
      cookingRecipe: recipe
    })
  },

  onStartCooking() {
    const recipe = this.data.cookingRecipe
    if (!recipe) return
    this._updateGameState({ coins: -recipe.cost })
    this.setData({ showRecipeSteps: false, isCooking: true, cookingProgress: 0 })
    let prog = 0
    const timer = setInterval(() => {
      prog += 20
      this.setData({ cookingProgress: prog })
      if (prog >= 100) {
        clearInterval(timer)
        this.setData({ isCooking: false, cookingProgress: 0, cookingRecipe: null })
        this._updateGameState({ energy: recipe.energy, mood: recipe.mood, exp: 15 })
        this._showGameToast(recipe.emoji, `${recipe.name}出锅啦！体力+${recipe.energy}`)
        this._updateDogState({ hunger: 5 })
      }
    }, recipe.time * 200)
  },

  onBackToRecipeList() {
    this.setData({ showRecipeSteps: false, cookingRecipe: null })
  },

  // ===== 水槽 =====
  onWashDishes() {
    this._updateGameState({ mood: 5, exp: 3 })
    this._showGameToast('💧', '洗完碗了！心情+5')
    this.setData({ showPanel: false })
  },

  // ===== 橱柜 =====
  onOrganizeCabinet() {
    this._updateGameState({ mood: 5, coins: 3, exp: 5 })
    this._showGameToast('✨', '整理完毕！+3金币')
    this.setData({ showPanel: false })
  },

  // ===== 电视 + 新闻 =====
  onWatchTV() {
    if (this.data.energy < 5) {
      this._showGameToast('😴', '太累了看不了电视...')
      return
    }
    this.setData({ tvLoadingNews: true, showTvNews: false })
    setTimeout(() => {
      const shuffled = [...NEWS_POOL].sort(() => 0.5 - Math.random())
      const news = shuffled.slice(0, 5).map((item, i) => ({
        id: i + 1,
        title: item.title,
        source: item.source,
        time: `${Math.floor(Math.random() * 10 + 1)}小时前`
      }))
      this.setData({ tvNews: news, tvLoadingNews: false, showTvNews: true, tvPlaying: true })
      this._updateGameState({ mood: 15, energy: -5, exp: 5 })
    }, 1200)
  },

  onCloseTVNews() {
    this.setData({ showTvNews: false, tvPlaying: false })
  },

  // ===== 沙发 =====
  onSitSofa() {
    this._updateGameState({ energy: 10, mood: 5 })
    this._showGameToast('😌', '休息一下...体力+10')
    this.setData({ showPanel: false })
  },

  // ===== 茶几 =====
  onMakeTea() {
    if (this.data.coins < 2) { this._showGameToast('💸', '金币不够泡茶！'); return }
    this._updateGameState({ coins: -2, mood: 10, energy: 5 })
    this.setData({ hasTea: true })
    this._showGameToast('☕', '泡好一杯热茶！心情+10')
    setTimeout(() => this.setData({ hasTea: false }), 30000)
  },
  onDrinkTea() {
    this.setData({ hasTea: false })
    this._updateGameState({ mood: 5, energy: 3 })
    this._showGameToast('😊', '喝茶真惬意~')
    this.setData({ showPanel: false })
  },

  // ===== 盆栽 =====
  onWaterPlant() {
    if (this.data.plantWatered) { this._showGameToast('🌱', '今天已经浇过水了'); return }
    this.setData({ plantWatered: true, plantGrowth: this.data.plantGrowth + 1 })
    this._updateGameState({ mood: 8, exp: 5, coins: 2 })
    this._showGameToast('🌿', '浇水完成！心情+8 金币+2')
  },

  // ===== 床 / 闹钟 =====
  onAlarmHourChange(e) { this.setData({ alarmHour: e.detail.value }) },
  onAlarmMinuteChange(e) { this.setData({ alarmMinute: e.detail.value }) },
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
    this._showGameToast('💤', '开始睡觉...')
    let count = 5
    const t = setInterval(() => {
      count--
      this.setData({ sleepCountdown: `${count}s` })
      if (count <= 0) {
        clearInterval(t)
        this.setData({ isSleeping: false, sleepCountdown: '' })
        this._updateGameState({ energy: 50 })
        this._showGameToast('🌅', '睡醒了！体力+50')
      }
    }, 1000)
  },

  // ===== 衣柜 =====
  onChangeClothes() {
    this._updateGameState({ mood: 10, exp: 3 })
    this._showGameToast('👔', '换了新衣服！心情+10')
    this.setData({ showPanel: false })
  },

  // ===== 书桌 - 学习 + 外语学习 =====
  onSwitchStudyMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ studySubMode: mode, cardFlipped: false })
  },

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

  _buildLangCards() {
    const items = storage.getItems()
    if (items.length === 0) {
      this.setData({ langCards: [] })
      return
    }
    const { INGREDIENTS_DB } = require('../../utils/ingredients')
    const settings = storage.getSettings()
    const lang = settings.language || 'en'
    const langMap = { en: '英语', ja: '日语', ko: '韩语', fr: '法语', es: '西语', de: '德语' }

    const cards = []
    const seen = new Set()
    items.forEach(item => {
      const tpl = INGREDIENTS_DB.find(i => i.name === item.name || i.id === item.templateId)
      if (tpl && tpl.translations && tpl.translations[lang] && !seen.has(tpl.id)) {
        seen.add(tpl.id)
        cards.push({
          chName: tpl.name,
          icon: tpl.icon,
          translation: tpl.translations[lang].name,
          phonetic: tpl.translations[lang].phonetic,
          langName: langMap[lang] || '英语'
        })
      }
    })
    cards.sort(() => 0.5 - Math.random())
    this.setData({
      langCards: cards, currentCardIdx: 0, cardFlipped: false,
      langCode: lang, langName: langMap[lang] || '英语'
    })
  },

  onFlipCard() {
    this.setData({ cardFlipped: !this.data.cardFlipped })
  },

  onNextCard() {
    const next = (this.data.currentCardIdx + 1) % this.data.langCards.length
    this.setData({ currentCardIdx: next, cardFlipped: false })
    if (next === 0) {
      this._updateGameState({ exp: 10, mood: 5 })
      this._showGameToast('🎓', '完成一轮学习！+10经验')
    }
  },

  onPrevCard() {
    const prev = (this.data.currentCardIdx - 1 + this.data.langCards.length) % this.data.langCards.length
    this.setData({ currentCardIdx: prev, cardFlipped: false })
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
        this._updateGameState({ mood: 15, energy: 5, exp: 5 })
        this._showGameToast('🚿', '洗完澡了！心情+15 体力+5')
        this.setData({ showPanel: false })
      }
    }, 600)
  },

  // ===== 马桶 =====
  onUseToilet() {
    this._updateGameState({ mood: 3, exp: 1 })
    this._showGameToast('🚽', '...舒服了')
    this.setData({ showPanel: false })
  },

  // ===== 洗手台 =====
  onWashHands() {
    this._updateGameState({ mood: 5, exp: 2 })
    this._showGameToast('🧼', '手洗干净了！')
    this.setData({ showPanel: false })
  },
  onBrushTeeth() {
    this._updateGameState({ mood: 5, exp: 3 })
    this._showGameToast('🪥', '刷完牙清新一整天')
    this.setData({ showPanel: false })
  },

  // ===== 大门 + 天气 =====
  onGoOut() {
    if (this.data.energy < 20) {
      this._showGameToast('😫', '太累了出不了门...')
      return
    }
    this._updateGameState({ energy: -20, coins: 15, exp: 15, mood: 10 })
    this._showGameToast('🚶', '出门逛了一圈！+15金币')
    this.setData({ showPanel: false })
    this._fetchWeather()
  },

  _fetchWeather() {
    const settings = storage.getSettings()
    const city = settings.city || '北京'
    setTimeout(() => {
      const weather = getMockWeather(city)
      this.setData({ weather, showWeather: true })
    }, 800)
  },

  onCloseWeather() {
    this.setData({ showWeather: false })
  },

  // ===== 小狗互动 =====
  onFeedDog() {
    if (this.data.coins < 5) { this._showGameToast('💸', '金币不够买狗粮！'); return }
    this._updateGameState({ coins: -5 })
    this._updateDogState({ hunger: 30 })
    const d = loadDog(); d.state = 'eating'; d.lastFed = Date.now(); saveDog(d)
    this.setData({ dogState: 'eating' })
    this._showDogBubble('😋')
    this._showGameToast('🍖', `喂${this.data.dogName}吃饭！`)
    setTimeout(() => {
      const d2 = loadDog(); d2.state = 'idle'; saveDog(d2)
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
    if (this.data.energy < 10) { this._showGameToast('😴', '太累了...'); return }
    this._updateGameState({ energy: -10, mood: 15, exp: 5 })
    this._updateDogState({ mood: 20, hunger: -10 })
    const d = loadDog(); d.tricks = (d.tricks || 0) + 1; d.state = 'playing'; saveDog(d)
    this.setData({ dogState: 'playing', dogTricks: d.tricks })
    this._showDogBubble('🎾')
    this._showGameToast('🎾', `和${this.data.dogName}玩耍！`)
    setTimeout(() => {
      const d2 = loadDog(); d2.state = 'idle'; saveDog(d2)
      this.setData({ dogState: 'idle' })
    }, 3000)
  },
  onWashDog() {
    this._updateDogState({ clean: 30, mood: -5 })
    this._updateGameState({ exp: 5 })
    this._showDogBubble('🫧')
    this._showGameToast('🛁', `给${this.data.dogName}洗澡！`)
  },

  // ===== 女朋友互动 =====
  onSelectGFTone(e) {
    this.setData({ gfTone: e.currentTarget.dataset.tone })
  },

  onChatGF() {
    const tone = this.data.gfTone
    const gf = loadGF()
    const responses = GF_RESPONSES[tone]

    let lastIdx = (gf.lastIdx && gf.lastIdx[tone]) || -1
    let newIdx
    do {
      newIdx = Math.floor(Math.random() * responses.length)
    } while (newIdx === lastIdx && responses.length > 1)

    if (!gf.lastIdx) gf.lastIdx = { sweet: -1, playful: -1, caring: -1 }
    gf.lastIdx[tone] = newIdx
    gf.interactCount = (gf.interactCount || 0) + 1
    gf.mood = Math.min(100, (gf.mood || 80) + 5)

    if (gf.interactCount % 10 === 0) {
      gf.level = (gf.level || 1) + 1
      this._showGameToast('💞', `恋爱等级升到 Lv.${gf.level}！`)
    }
    saveGF(gf)

    const resp = responses[newIdx]
    this.setData({
      gfResponse: resp.text,
      gfInteractCount: gf.interactCount,
      gfLevel: gf.level,
      gfMood: gf.mood
    })
    this._updateGameState({ mood: resp.mood })
    this.setData({ showGFBubble: true, gfBubbleText: '💬' })
    setTimeout(() => this.setData({ showGFBubble: false }), 3000)
    wx.vibrateShort({ type: 'light' })
  }
})
