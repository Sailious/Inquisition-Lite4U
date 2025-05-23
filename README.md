
# Inquisition-Lite4U

基于Angular CLI version 17.2.3. 开发的Inquisition的简单用户前端,用过的应该都知道是哪个[后端](https://github.com/AegirTech/Inquisition)（雾



## 环境变量

修改地址后开箱即用

要在Vercel等平台部署这个项目，你将需要在你的src/environments/environment.ts文件中`apiUrl`修改成你自己的已部署好的[后端](https://github.com/AegirTech/Inquisition)地址（需HTTPS)


## 在本地运行

Clone 这个 project

```bash
  git clone https://github.com/Sailious/Inquisition-Lite4U.git
```

前往项目目录

```bash
  cd Inquisition-Lite4U
```

安装依赖

```bash
  npm install
```
修改src/environments/environment.development.ts文件里的`apiUrl`为已部署好的[后端](https://github.com/AegirTech/Inquisition)地址

启动服务器

```bash
  ng server -O
```


## 致谢

 - [AegirTech](https://github.com/AegirTech)
 - [糕总](https://github.com/DazeCake)
 - [糕总和DOYO佬写的后端](https://github.com/AegirTech/Inquisition)


