process.env.UNI_USING_VUE3 = true
process.env.UNI_USING_VUE3_OPTIONS_API = true
module.exports = {
  css: {
    loaderOptions: {
      sass: {
        prependData: `@import "@/styles/var.scss";`, //引入全局变量
      },
    },
  },
  configureWebpack: {
    resolve: {
      extensions: ['.js', '.ts', '.vue', '.json'],
    },
  },
}
