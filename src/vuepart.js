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
      detailPage: false
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
      copy2clip (index) {
        console.log(this.$refs.colorname[index])
        this.$refs.colorname[index].select()
        const result = document.execCommand('copy')
        console.log(result)
      }
    },
    mounted () {
      console.log(this.$refs.header)
      this.header_width = this.$refs.header.map(v => {
        const { width } = v.getBoundingClientRect()
        return width
      })
      this.slider_width = this.header_width[this.chosen_index]
      console.log(this.slider_width)
      console.log(this.partData)
    }
  }
})())
