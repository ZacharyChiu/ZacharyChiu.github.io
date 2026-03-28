// Hexxagon 游戏配置文件
// 用于游戏调试和破解

const GameConfig = {
    // 是否开启调试模式
    debugMode: true,

    // 是否解锁所有关卡
    unlockAllLevels: true,

    // 是否显示调试信息
    showDebugInfo: false,

    // AI 思考时间（毫秒），0 表示立即行动
    aiThinkTime: 100,

    // 是否显示有效移动提示
    showValidMoves: true,

    // 是否启用动画
    enableAnimations: true,

    // 游戏速度倍率
    gameSpeed: 1,

    // 初始得分（作弊模式）
    initialScores: {
        player1: 10,
        player2: 10,
        player3: 0
    },

    // 是否禁用AI（方便测试）
    disableAI: false,

    // 强制玩家模式：1=玩家1, 2=玩家2, 3=玩家3
    // 设置为 null 表示正常模式
    forcePlayerTurn: null,

    // 是否显示胜利动画
    showWinAnimation: true,

    // 是否允许撤销（暂未实现）
    allowUndo: false,

    // 最大撤销步数
    maxUndoSteps: 5,

    // 自动保存游戏进度
    autoSave: true,

    // 自定义棋盘大小
    customBoardRadius: 4,

    // 关卡配置（用于自定义）
    customLevels: {
        enabled: false,
        levels: []
    }
};

// 在游戏加载时应用配置
window.addEventListener('DOMContentLoaded', () => {
    // 等待游戏控制器初始化
    setTimeout(() => {
        if (window.gameController && window.gameController.game) {
            applyConfig();
            console.log('✓ Game configuration loaded');
        }
    }, 100);
});

// 应用配置到游戏
function applyConfig() {
    const game = window.gameController.game;

    // 解锁所有关卡
    if (GameConfig.unlockAllLevels) {
        game.levels.forEach(level => {
            level.unlocked = true;
            level.completed = true;
            level.stars = 3;
        });
        console.log('✓ All levels unlocked with 3 stars');
    }

    // 应用自定义棋盘大小
    if (GameConfig.customBoardRadius !== 4) {
        game.boardRadius = GameConfig.customBoardRadius;
        console.log(`✓ Custom board radius: ${GameConfig.customBoardRadius}`);
    }

    // 禁用AI
    if (GameConfig.disableAI) {
        game.isAIEnabled = false;
        game.aiPlayers = [];
        console.log('✓ AI disabled');
    }

    // 应用自定义初始得分
    if (GameConfig.initialScores) {
        console.log('✓ Custom initial scores configured');
    }

    // 强制玩家回合（用于测试）
    if (GameConfig.forcePlayerTurn) {
        game.currentPlayer = GameConfig.forcePlayerTurn;
        console.log(`✓ Forced player turn: ${GameConfig.forcePlayerTurn}`);
    }

    // 调试信息
    if (GameConfig.showDebugInfo) {
        showDebugPanel();
    }
}

// 显示调试面板
function showDebugPanel() {
    if (!GameConfig.debugMode) return;

    const debugPanel = document.createElement('div');
    debugPanel.id = 'debug-panel';
    debugPanel.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0, 0, 0, 0.85);
        color: #0f0;
        padding: 15px;
        border-radius: 10px;
        font-family: 'Courier New', monospace;
        font-size: 12px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.5);
    `;

    const updateDebugInfo = () => {
        const game = window.gameController?.game;
        if (!game) return;

        const scores = game.calculateScores();
        const validMoves = game.getValidMoves(game.currentPlayer);

        debugPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #0f0; padding-bottom: 5px;">
                🔧 DEBUG PANEL
            </div>
            <div>当前模式: ${game.gameMode}</div>
            <div>当前玩家: ${game.currentPlayer}</div>
            <div>玩家模式: ${game.threePlayerMode ? '3人' : '2人'}</div>
            <div>AI启用: ${game.isAIEnabled ? '是' : '否'}</div>
            <div style="margin: 10px 0; border-top: 1px solid #0f0; padding-top: 5px;">
                <div style="font-weight: bold;">📊 得分:</div>
                <div style="color: #ff6b6b;">P1: ${scores[1]}</div>
                <div style="color: #4ecdc4;">P2: ${scores[2]}</div>
                ${game.threePlayerMode ? `<div style="color: #ffe66d;">P3: ${scores[3]}</div>` : ''}
            </div>
            <div>
                <div style="font-weight: bold;">🎯 有效移动: ${validMoves.length}</div>
                <div>空格数: ${game.countEmptyCells()}</div>
                <div>游戏结束: ${game.gameOver ? '是' : '否'}</div>
            </div>
            <div style="margin-top: 10px; padding-top: 5px; border-top: 1px solid #0f0;">
                <button onclick="debugActions.instantWin()" style="background: #28a745; color: white; border: none; padding: 5px 10px; cursor: pointer; margin: 2px; font-size: 10px;">🏆 立即获胜</button>
                <button onclick="debugActions.addPieces()" style="background: #007bff; color: white; border: none; padding: 5px 10px; cursor: pointer; margin: 2px; font-size: 10px;">➕ 加棋子</button>
                <button onclick="debugActions.resetBoard()" style="background: #dc3545; color: white; border: none; padding: 5px 10px; cursor: pointer; margin: 2px; font-size: 10px;">🔄 重置</button>
            </div>
        `;
    };

    // 调试操作
    window.debugActions = {
        instantWin: () => {
            const game = window.gameController?.game;
            if (!game) return;
            game.board[0][0] = 1;
            game.draw();
            updateDebugInfo();
            console.log('✓ Instant win activated');
        },
        addPieces: () => {
            const game = window.gameController?.game;
            if (!game) return;
            for (let q = -2; q <= 2; q++) {
                for (let r = -2; r <= 2; r++) {
                    if (game.isValidHex(q, r) && game.board[q][r] === 0) {
                        game.board[q][r] = game.currentPlayer;
                    }
                }
            }
            game.draw();
            updateDebugInfo();
            console.log('✓ Pieces added');
        },
        resetBoard: () => {
            const game = window.gameController?.game;
            if (!game) return;
            game.startGame();
            updateDebugInfo();
            console.log('✓ Board reset');
        }
    };

    // 定时更新
    setInterval(updateDebugInfo, 500);
    document.body.appendChild(debugPanel);
    updateDebugInfo();
    console.log('✓ Debug panel activated');
}

// 快捷键
document.addEventListener('keydown', (e) => {
    // Ctrl + D: 切换调试面板
    if (e.ctrlKey && e.key === 'd') {
        const panel = document.getElementById('debug-panel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    // Ctrl + U: 解锁所有关卡
    if (e.ctrlKey && e.key === 'u') {
        const game = window.gameController?.game;
        if (game) {
            game.levels.forEach(level => {
                level.unlocked = true;
                level.completed = true;
                level.stars = 3;
            });
            console.log('✓ All levels unlocked!');
            alert('所有关卡已解锁！');
        }
    }

    // Ctrl + R: 重置游戏
    if (e.ctrlKey && e.key === 'r') {
        e.preventDefault();
        const game = window.gameController?.game;
        if (game) {
            game.startGame();
            console.log('✓ Game reset');
        }
    }

    // Ctrl + W: 立即获胜
    if (e.ctrlKey && e.key === 'w') {
        const game = window.gameController?.game;
        if (game && !game.gameOver) {
            game.handleGameOver();
            console.log('✓ Game ended');
        }
    }

    // 数字键 1, 2, 3: 强制切换玩家
    if (e.key >= '1' && e.key <= '3') {
        const player = parseInt(e.key);
        const game = window.gameController?.game;
        if (game) {
            game.currentPlayer = player;
            game.updateTurnIndicator();
            console.log(`✓ Switched to player ${player}`);
        }
    }
});

console.log('=================================');
console.log('🎮 Hexxagon Config Loaded');
console.log('=================================');
console.log('快捷键:');
console.log('  Ctrl + D: 切换调试面板');
console.log('  Ctrl + U: 解锁所有关卡');
console.log('  Ctrl + R: 重置游戏');
console.log('  Ctrl + W: 立即结束游戏');
console.log('  1, 2, 3: 切换玩家');
console.log('=================================');
