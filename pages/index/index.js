Page({
  data: {
    hours: '00',
    minutes: '00',
    seconds: '00',
    date: '',
    weekday: '',
    period: ''
  },

  timer: null,

  onLoad() {
    this.updateTime()
    this.timer = setInterval(() => {
      this.updateTime()
    }, 1000)
  },

  onUnload() {
    if (this.timer) {
      clearInterval(this.timer)
    }
  },

  updateTime() {
    const now = new Date()
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
    const months = ['一月', '二月', '三月', '四月', '五月', '六月',
                    '七月', '八月', '九月', '十月', '十一月', '十二月']

    let hours = now.getHours()
    const period = hours < 12 ? '上午' : hours < 18 ? '下午' : '晚上'
    const hours12 = hours % 12 || 12

    this.setData({
      hours: String(hours12).padStart(2, '0'),
      minutes: String(now.getMinutes()).padStart(2, '0'),
      seconds: String(now.getSeconds()).padStart(2, '0'),
      date: `${now.getFullYear()}年 ${months[now.getMonth()]} ${now.getDate()}日`,
      weekday: weekdays[now.getDay()],
      period
    })
  }
})
