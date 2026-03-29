# 皮肤功能说明

## 概述

皮肤功能允许为每个玩家的棋子设置自定义图案。皮肤图片会显示在棋子的圆形部分，玩家阵营的颜色通过六边形的其余部分（背景）来展示。

## 文件结构

```
skin/
├── skin-config.json    # 皮肤配置文件
├── player01.jpg       # 玩家1皮肤
├── player02.jpg       # 玩家2皮肤（可选）
└── player03.jpg       # 玩家3皮肤（可选）
```

## 配置文件

### skin-config.json

```json
{
  "enabled": true,
  "skins": {
    "player1": {
      "file": "player01.jpg",
      "scale": 0.7
    },
    "player2": {
      "file": "",
      "scale": 0.7
    },
    "player3": {
      "file": "",
      "scale": 0.7
    }
  }
}
```

### 配置说明

- **enabled**: 是否启用皮肤功能（true/false）
- **skins**: 皮肤配置对象
  - **player1/2/3**: 对应玩家的皮肤配置
    - **file**: 皮肤文件名（留空表示不使用皮肤）
    - **scale**: 皮肤缩放比例（0.1-1.0，建议0.6-0.8）

## 皮肤图片要求

- **格式**: JPG、PNG 等浏览器支持的图片格式
- **尺寸**: 建议正方形图片（如 300x300）
- **内容**: 建议使用简洁的图案或图标
- **背景**: 建议使用透明背景（PNG）或单一背景色

## 如何添加新皮肤

1. 将皮肤图片文件放入 `skin/` 文件夹
2. 在 `skin-config.json` 中添加或修改配置
3. 刷新游戏页面即可看到效果

## 示例

### 为玩家2添加皮肤

```json
{
  "enabled": true,
  "skins": {
    "player1": {
      "file": "player01.jpg",
      "scale": 0.7
    },
    "player2": {
      "file": "player02.jpg",
      "scale": 0.7
    },
    "player3": {
      "file": "",
      "scale": 0.7
    }
  }
}
```

### 禁用皮肤功能

将 `enabled` 设置为 `false`：

```json
{
  "enabled": false,
  "skins": { ... }
}
```

## 注意事项

1. 皮肤图片会被裁剪为圆形显示
2. 如果皮肤图片加载失败，会自动使用默认样式
3. 缩放比例建议在 0.6-0.8 之间，过大可能导致图片超出圆形区域
4. 需要通过 HTTP 服务器运行游戏才能加载皮肤文件（file:// 协议不支持）
