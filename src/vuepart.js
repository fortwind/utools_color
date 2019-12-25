const vm = new Vue((() => {
  return {
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
      copiedShow: false,
      copiedMessage: '',
      copiedColor: ''
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
        }, 400)
      },
      goBack () {
        this.loadmask = false
        setTimeout(() => {
          this.detailPage = false
        }, 400)
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
          }, 1000)
        })
      },
      colorWithFormat(color) {
        if (this.format === "hex") return color
        else if (this.format === "hex2") return color.substring(1)
        else if (this.format === "rgb") return this.hexToRgb(color)
        else if (this.format === "rgba") {
          let code = this.hexToRgb(color);
          code = code.replace("rgb", "rgba").substring(0, code.length)
          code += ",1.0)"
          return code
        }
      },
      hexToRgb(hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
        hex = hex.replace(shorthandRegex, function (m, r, g, b) {
          return r + r + g + g + b + b
        })

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
          ? `rgb(${parseInt(result[1], 16)}, ${parseInt(
            result[2],
            16
          )}, ${parseInt(result[3], 16)})`
          : null
      }
    },
    mounted() {
      this.header_width = this.$refs.header.map(v => {
        const { width } = v.getBoundingClientRect()
        return width
      })
      console.log(this.copiedShow)
      this.slider_width = this.header_width[this.chosen_index]
    }
  }
})())
