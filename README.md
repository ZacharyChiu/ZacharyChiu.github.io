# Hexxagon - 占领六边形

策略棋盘游戏

## 游戏规则

- **复制移动**: 将棋子移动到相邻的空格，会在原位置和新位置各保留一个棋子
- **跳跃移动**: 将棋子跳跃到距离为2的空格，原位置的棋子会移动到新位置
- **转换机制**: 跳跃或复制后，目标位置周围所有对手的棋子都会变成你的
- **获胜条件**: 当棋盘填满或无法移动时，拥有更多棋子的玩家获胜

## 游戏模式

1. **解谜模式**: 挑战预设关卡，获得星级评价
2. **自定义地图**: 创建和分享你的自定义地图
3. **PVP模式**: 2人本地对战

## 如何开始

直接在浏览器中打开 `index.html` 文件即可开始游戏

## 文件说明

- `index.html` - 游戏主页面
- `styles.css` - 游戏样式
- `game.js` - 游戏逻辑
- `config.js` - 配置文件（包含调试和破解功能）
- `custom-maps/` - 自定义地图文件夹
  - `README.md` - 地图文件夹说明
  - `example_map.json` - 示例地图文件

## 自定义地图功能

### 创建自定义地图

1. 点击主菜单的"自定义地图"
2. 选择地图类型和大小
3. 使用编辑模式（添加/移除格子、设置棋子）
4. 点击"保存地图"
5. 地图会自动下载JSON文件，请保存到 `custom-maps/` 文件夹
6. 地图自动添加到解谜模式关卡列表

### 导入地图

1. 在自定义地图编辑器中点击"导入地图"
2. 选择JSON文件
3. 地图自动添加到关卡列表

### 地图文件格式

地图JSON文件示例：

```json
{
  "id": "custom_1234567890",
  "name": "我的地图",
  "radius": 4,
  "board": {
    "-3": {
      "0": 0,
      "1": 1
    }
  },
  "createdAt": "2026-03-28T12:00:00.000Z",
  "isCustom": true
}
```

详见 `custom-maps/README.md`

## 配置文件功能

`config.js` 提供了多种调试和破解功能：

### 配置选项

```javascript
// 解锁所有关卡
unlockAllLevels: true

// 禁用AI（方便测试）
disableAI: false

// 自定义棋盘大小
customBoardRadius: 4

// AI思考时间（毫秒）
aiThinkTime: 100

// 显示调试信息
showDebugInfo: true

// 调试模式
debugMode: true
```

### 快捷键

- **Ctrl + D**: 切换调试面板显示/隐藏
- **Ctrl + U**: 解锁所有关卡（全部关卡3星通过）
- **Ctrl + R**: 重置游戏
- **Ctrl + W**: 立即结束游戏
- **1, 2, 3**: 强制切换到指定玩家

### 调试面板功能

当 `showDebugInfo: true` 时，会在游戏界面右上角显示调试面板，包含：

- 实时游戏状态信息
- 当前玩家得分
- 有效移动数量
- 空格数量
- 快捷按钮：
  - 🏆 立即获胜
  - ➕ 加棋子
  - 🔄 重置棋盘

### 使用方法

1. 打开游戏时，配置会自动加载
2. 默认已启用：
   - 解锁所有关卡（全部3星）
   - 调试面板
   - 调试模式
3. 可以通过修改 `config.js` 文件来调整各种设置
4. 关闭配置文件：删除或注释掉 `config.js` 的引入即可恢复正常游戏

### 修改配置

编辑 `config.js` 文件中的 `GameConfig` 对象：

```javascript
const GameConfig = {
    debugMode: true,          // 调试模式
    unlockAllLevels: true,    // 解锁所有关卡
    showDebugInfo: true,      // 显示调试信息
    disableAI: false,         // 禁用AI
    aiThinkTime: 100,         // AI思考时间
    customBoardRadius: 4,     // 棋盘大小
    // ... 更多配置
};
```

### 禁用破解功能

要恢复正常游戏体验，可以：
1. 将 `config.js` 中的相关选项设为 `false`
2. 或者在 `index.html` 中注释掉 `<script src="config.js"></script>`

## 开发说明

- 使用 HTML5 Canvas 绘制游戏
- 纯 JavaScript 实现，无需依赖
- 响应式设计，支持移动端和桌面端
