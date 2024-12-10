# frontend

## Tips
由于一些依赖版本我们多次调整，并且国内网络情况不稳定，经常无法下载electron，
因此我强烈建议直接使用我们提供好的node_module压缩包，这样可以节省很多时间。

## Project setup
如果网络状态没有问题，可以直接运行
```
npm install --force
```
如果安装失败提示没有网，或者安装速度太慢，先换源
```
npm config set registry https://registry.npmmirror.com
```
### 也可以选择Install Electron with cnpm

```
npm install -g cnpm --registry=https://registry.npmmirror.com
```
```
cnpm install electron
```

### 开发模式运行
```
npm run dev
```
### 在浏览器中运行
```
npm run serve
```
