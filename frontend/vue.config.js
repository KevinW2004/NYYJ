const {defineConfig} = require('@vue/cli-service')
module.exports = defineConfig({
    pluginOptions: {
        electronBuilder: {
            mainProcessFile: 'src/background.ts', // 主进程入口
            preload: 'src/preload.ts',           // preload 文件路径
            outputDir: 'dist_electron',          // 构建输出目录
        },
        vuetify: {
            // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
        }
    }
})
