# Hexxagon 游戏启动说明

## 快速启动

### Windows 用户
直接双击 **`启动游戏.bat`** 文件即可启动游戏！

### 跨平台用户
在命令行中运行：
```bash
python 启动游戏.py
```

## 手动启动

如果启动脚本无法使用，可以手动启动服务器：

### 使用 Python
```bash
python -m http.server 8000
```

### 使用 Python 2
```bash
python -m SimpleHTTPServer 8000
```

### 使用 Node.js
```bash
# 全局安装 http-server
npm install -g http-server

# 启动服务器
http-server -p 8000
```

### 使用 VS Code Live Server
1. 安装 Live Server 扩展
2. 右键点击 index.html
3. 选择 "Open with Live Server"

## 访问游戏

服务器启动后，在浏览器中访问：
**http://localhost:8000**

## 停止服务器

在命令行窗口中按 `Ctrl+C` 即可停止服务器。

## 常见问题

### Q: 为什么不能用直接打开 HTML 文件的方式？
A: 浏览器的安全策略阻止了 `file://` 协议下的网络请求，必须使用 HTTP 服务器。

### Q: 端口 8000 被占用怎么办？
A: 修改启动脚本中的端口号，或者使用其他端口，例如：
```bash
python -m http.server 8080
```

### Q: 没有安装 Python 怎么办？
A: 访问 https://www.python.org/downloads/ 下载并安装 Python。

## 地图文件

游戏会自动加载 `custom-maps` 文件夹中的所有地图文件（*.json）。
确保地图文件放在正确的位置。
