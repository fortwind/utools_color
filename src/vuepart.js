const vm = new Vue((() => {
  return {
    el: '#app',
    data: {
      partName: jsonData.map(v => v.name),
      partUrl: jsonData.map(v => v.data.url),
      partData: jsonData.map(v => v.data.inner),
      chosen_index: 0
    },
    mounted () {
      console.log(this.partData)
    }
  }
})())
