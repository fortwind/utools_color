const vm = new Vue({
  el: '#app',
  data: {
    partName: jsonData.map(v => v.name),
    partUrl: jsonData.map(v => v.data.url),
    partData: jsonData.map(v => v.data.inner),
    chosen_colors: [],
    chosen_index: 0,
    header_width: [0, 0],
    slider_width: 0,
    transform_dist: 0,
    loadmask: false,
    loadmask2right: false,
    detailPage: false,
    emoji_array,
    emojiChange: '',
    copiedShow: false,
    copiedMessage: '',
    copiedColor: ''
  },
  computed: {
    curPartData () {
      return this.partData[this.chosen_index]
    }
  },
  methods: {
    changeColors (index) {
      this.chosen_index = index
      this.slider_width = this.header_width[index]
      this.transform_dist = index - 1 < 0 ? 0 : this.header_width[index - 1]
    },
    getDetail (index) {
      if (this.loadmask) return false
      this.chosen_colors = this.partData[this.chosen_index][index].colors
      this.loadmask = true
      setTimeout(() => {
        this.detailPage = true
      }, 300) // .mask transform
    },
    goBack () {
      this.loadmask = false
      setTimeout(() => {
        this.detailPage = false
      }, 300) // .mask transform
    },
    copy2clip () {
      const messages = ['COPIED!', 'GOT IT!', 'PASTE ME!', 'IT\'LL ROCK!', 'RIGHT ONE!', 'WILL DO!']
      new ClipboardJS('.bigcolor', {
        text: (trigger) => {
          const color = trigger.style.backgroundColor
          return color
        }
      }).on('success', ({text}) => {
        this.copiedMessage = messages[Math.floor(Math.random() * messages.length)]
        this.copiedColor = text
        this.copiedShow = true
        setTimeout(() => {
          this.copiedShow = false
          this.copiedMessage = ''
          this.copiedColor = ''
        }, 1000) // .colorshow animation
      })
    },
    innerenter (index) {
      // const emojis = this.emoji_array[Math.round(Math.random() * (this.emoji_array.length - 1))].emojis
      // const l = emojis.length - 1
      // const spanemoji = this.$refs.emoji[index]

      // let showindex = 0
      // spanemoji.innerText = emojis[showindex]

      // this.emojiChange = setInterval(() => {
      //   showindex = showindex < l ? (showindex + 1) : 0
      //   spanemoji.innerText = emojis[showindex]
      // }, 1000)
    },
    innerleave (index) {
      // clearInterval(this.emojiChange)
      // this.$refs.emoji[index].innerText = ''
    }
  },
  mounted() {
    this.header_width = this.$refs.header.map(v => {
      const { width } = v.getBoundingClientRect()
      return width
    })
    this.slider_width = this.header_width[this.chosen_index]
  }
})
