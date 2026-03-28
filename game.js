// Hexxagon 游戏逻辑
class Hexxagon {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.hexSize = 35;
        this.board = [];
        this.players = [1, 2]; // 1: 红色, 2: 青色, 3: 黄色
        this.currentPlayer = 1;
        this.selectedHex = null;
        this.validMoves = [];
        this.gameOver = false;
        this.isAIEnabled = false;
        this.aiPlayers = [2];
        this.threePlayerMode = false;
        this.gameMode = 'puzzle';
        this.levels = [];
        this.currentLevel = 0;
        this.scores = {};
        this.animationQueue = [];

        // 棋盘布局配置
        this.boardRadius = 4;
        this.cellColors = {
            0: '#e8e8e8', // 空格
            1: '#ff6b6b', // 玩家1 - 红色
            2: '#4ecdc4', // 玩家2 - 青色
            3: '#ffe66d'  // 玩家3 - 黄色
        };

        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    // 初始化棋盘
    initBoard(radius = 4) {
        this.boardRadius = radius;
        this.board = [];
        for (let q = -radius; q <= radius; q++) {
            this.board[q] = {};
            for (let r = -radius; r <= radius; r++) {
                if (Math.abs(q + r) <= radius) {
                    this.board[q][r] = 0;
                }
            }
        }
    }

    // 获取六边形中心坐标
    hexToPixel(q, r) {
        const x = this.hexSize * (3/2 * q);
        const y = this.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
        return { x: x + this.canvas.width/2, y: y + this.canvas.height/2 };
    }

    // 像素坐标转换为六边形坐标
    pixelToHex(x, y) {
        const cx = x - this.canvas.width/2;
        const cy = y - this.canvas.height/2;
        const q = (2/3 * cx) / this.hexSize;
        const r = (-1/3 * cx + Math.sqrt(3)/3 * cy) / this.hexSize;
        return this.roundHex(q, r);
    }

    // 四舍五入到最近的六边形坐标
    roundHex(q, r) {
        let s = -q - r;
        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);

        const qDiff = Math.abs(rq - q);
        const rDiff = Math.abs(rr - r);
        const sDiff = Math.abs(rs - s);

        if (qDiff > rDiff && qDiff > sDiff) {
            rq = -rr - rs;
        } else if (rDiff > sDiff) {
            rr = -rq - rs;
        }

        return { q: rq, r: rr };
    }

    // 获取相邻六边形（距离1）
    getNeighbors(q, r) {
        const directions = [
            {q: 1, r: 0}, {q: 1, r: -1}, {q: 0, r: -1},
            {q: -1, r: 0}, {q: -1, r: 1}, {q: 0, r: 1}
        ];
        return directions.map(d => ({q: q + d.q, r: r + d.r}));
    }

    // 获取距离为2的六边形
    getDistanceTwo(q, r) {
        const directions = [
            {q: 2, r: 0}, {q: 2, r: -1}, {q: 2, r: -2},
            {q: 1, r: -2}, {q: 0, r: -2}, {q: -1, r: -1},
            {q: -2, r: 0}, {q: -2, r: 1}, {q: -2, r: 2},
            {q: -1, r: 2}, {q: 0, r: 2}, {q: 1, r: 1}
        ];
        return directions.map(d => ({q: q + d.q, r: r + d.r}));
    }

    // 检查坐标是否在棋盘上
    isValidHex(q, r) {
        return this.board[q] && this.board[q][r] !== undefined;
    }

    // 获取有效移动
    getValidMoves(player) {
        const moves = [];
        const cells = this.getPlayerCells(player);

        cells.forEach(cell => {
            // 检查复制移动（距离1）
            this.getNeighbors(cell.q, cell.r).forEach(neighbor => {
                if (this.isValidHex(neighbor.q, neighbor.r) && 
                    this.board[neighbor.q][neighbor.r] === 0) {
                    moves.push({
                        from: {q: cell.q, r: cell.r},
                        to: {q: neighbor.q, r: neighbor.r},
                        type: 'clone'
                    });
                }
            });

            // 检查跳跃移动（距离2）
            this.getDistanceTwo(cell.q, cell.r).forEach(target => {
                if (this.isValidHex(target.q, target.r) && 
                    this.board[target.q][target.r] === 0) {
                    moves.push({
                        from: {q: cell.q, r: cell.r},
                        to: {q: target.q, r: target.r},
                        type: 'jump'
                    });
                }
            });
        });

        return moves;
    }

    // 获取玩家的所有棋子位置
    getPlayerCells(player) {
        const cells = [];
        for (let q in this.board) {
            for (let r in this.board[q]) {
                if (this.board[q][r] === player) {
                    cells.push({q: parseInt(q), r: parseInt(r)});
                }
            }
        }
        return cells;
    }

    // 执行移动
    makeMove(move) {
        const { from, to, type } = move;
        const player = this.board[from.q][from.r];

        // 复制移动：保留原棋子，在目标位置放置新棋子
        // 跳跃移动：移动原棋子到目标位置
        if (type === 'clone') {
            this.board[to.q][to.r] = player;
        } else {
            this.board[from.q][from.r] = 0;
            this.board[to.q][to.r] = player;
        }

        // 转换周围对手的棋子
        this.convertNeighbors(to.q, to.r, player);

        return player;
    }

    // 转换周围的对手棋子
    convertNeighbors(q, r, player) {
        const neighbors = this.getNeighbors(q, r);
        neighbors.forEach(n => {
            if (this.isValidHex(n.q, n.r) && 
                this.board[n.q][n.r] !== 0 && 
                this.board[n.q][n.r] !== player) {
                this.board[n.q][n.r] = player;
            }
        });
    }

    // 计算得分
    calculateScores() {
        const scores = { 1: 0, 2: 0, 3: 0 };
        for (let q in this.board) {
            for (let r in this.board[q]) {
                const player = this.board[q][r];
                if (player > 0) {
                    scores[player]++;
                }
            }
        }
        return scores;
    }

    // 检查游戏是否结束
    isGameOver() {
        const emptyCells = this.countEmptyCells();
        
        // 检查当前玩家是否有有效移动
        const validMoves = this.getValidMoves(this.currentPlayer);
        
        // 检查所有玩家的有效移动
        let totalValidMoves = 0;
        this.players.forEach(player => {
            totalValidMoves += this.getValidMoves(player).length;
        });

        return emptyCells === 0 || validMoves.length === 0 || totalValidMoves === 0;
    }

    // 计算空格数量
    countEmptyCells() {
        let count = 0;
        for (let q in this.board) {
            for (let r in this.board[q]) {
                if (this.board[q][r] === 0) {
                    count++;
                }
            }
        }
        return count;
    }

    // 绘制游戏
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制所有六边形
        for (let q in this.board) {
            for (let r in this.board[q]) {
                const pos = this.hexToPixel(parseInt(q), parseInt(r));
                this.drawHex(pos.x, pos.y, this.board[q][r], parseInt(q), parseInt(r));
            }
        }

        // 高亮选中的六边形
        if (this.selectedHex) {
            const pos = this.hexToPixel(this.selectedHex.q, this.selectedHex.r);
            this.ctx.strokeStyle = '#ff0';
            this.ctx.lineWidth = 4;
            this.drawHexPath(pos.x, pos.y);
            this.ctx.stroke();
        }

        // 高亮有效移动
        this.validMoves.forEach(move => {
            const pos = this.hexToPixel(move.to.q, move.to.r);
            if (move.type === 'clone') {
                this.ctx.fillStyle = 'rgba(100, 255, 100, 0.5)';
            } else {
                this.ctx.fillStyle = 'rgba(255, 255, 100, 0.5)';
            }
            this.drawHexPath(pos.x, pos.y);
            this.ctx.fill();
        });
    }

    // 绘制单个六边形
    drawHex(x, y, player, q, r) {
        const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, this.hexSize);
        
        if (player === 0) {
            gradient.addColorStop(0, '#f0f0f0');
            gradient.addColorStop(1, '#d0d0d0');
        } else {
            gradient.addColorStop(0, this.lightenColor(this.cellColors[player], 30));
            gradient.addColorStop(1, this.cellColors[player]);
        }

        this.ctx.fillStyle = gradient;
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;

        this.drawHexPath(x, y);
        this.ctx.fill();
        this.ctx.stroke();

        // 如果有棋子，绘制棋子
        if (player > 0) {
            this.drawPiece(x, y, player);
        }
    }

    // 绘制棋子
    drawPiece(x, y, player) {
        const pieceSize = this.hexSize * 0.6;
        const gradient = this.ctx.createRadialGradient(x - pieceSize/3, y - pieceSize/3, 0, x, y, pieceSize);
        
        gradient.addColorStop(0, '#fff');
        gradient.addColorStop(0.3, this.cellColors[player]);
        gradient.addColorStop(1, this.darkenColor(this.cellColors[player], 20));

        this.ctx.beginPath();
        this.ctx.arc(x, y, pieceSize, 0, Math.PI * 2);
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }

    // 绘制六边形路径
    drawHexPath(x, y) {
        this.ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            // 使用0度角起始,使上下边水平
            const angle = (Math.PI / 3) * i;
            const hx = x + this.hexSize * Math.cos(angle);
            const hy = y + this.hexSize * Math.sin(angle);
            if (i === 0) {
                this.ctx.moveTo(hx, hy);
            } else {
                this.ctx.lineTo(hx, hy);
            }
        }
        this.ctx.closePath();
    }

    // 颜色变亮
    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + 
            (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
            (B < 255 ? B < 1 ? 0 : B : 255)
        ).toString(16).slice(1);
    }

    // 颜色变暗
    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return '#' + (0x1000000 + 
            (R > 0 ? R : 0) * 0x10000 + 
            (G > 0 ? G : 0) * 0x100 + 
            (B > 0 ? B : 0)
        ).toString(16).slice(1);
    }

    // 处理点击事件
    handleClick(e) {
        if (this.gameOver) return;
        
        // 如果是AI回合，不允许点击
        if (this.isAIEnabled && this.aiPlayers.includes(this.currentPlayer)) {
            return;
        }

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const hex = this.pixelToHex(x, y);

        if (!this.isValidHex(hex.q, hex.r)) return;

        const clickedPlayer = this.board[hex.q][hex.r];

        // 点击自己的棋子：选中
        if (clickedPlayer === this.currentPlayer) {
            this.selectedHex = hex;
            this.validMoves = this.getValidMovesForCell(hex.q, hex.r, this.currentPlayer);
            this.draw();
        }
        // 点击空格：移动
        else if (this.selectedHex && clickedPlayer === 0) {
            const move = this.validMoves.find(m => m.to.q === hex.q && m.to.r === hex.r);
            if (move) {
                this.makeMove(move);
                this.endTurn();
            }
        }
        // 点击其他：取消选择
        else {
            this.selectedHex = null;
            this.validMoves = [];
            this.draw();
        }
    }

    // 处理鼠标移动事件
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.canvas.style.cursor = 'default';
        
        const hex = this.pixelToHex(x, y);
        if (this.isValidHex(hex.q, hex.r)) {
            if (this.selectedHex && this.board[hex.q][hex.r] === 0) {
                const isValidMove = this.validMoves.some(m => 
                    m.to.q === hex.q && m.to.r === hex.r
                );
                if (isValidMove) {
                    this.canvas.style.cursor = 'pointer';
                }
            } else if (this.board[hex.q][hex.r] === this.currentPlayer) {
                this.canvas.style.cursor = 'pointer';
            }
        }
    }

    // 获取指定格子的有效移动
    getValidMovesForCell(q, r, player) {
        const moves = [];
        
        // 检查复制移动
        this.getNeighbors(q, r).forEach(neighbor => {
            if (this.isValidHex(neighbor.q, neighbor.r) && 
                this.board[neighbor.q][neighbor.r] === 0) {
                moves.push({
                    from: {q, r},
                    to: {q: neighbor.q, r: neighbor.r},
                    type: 'clone'
                });
            }
        });

        // 检查跳跃移动
        this.getDistanceTwo(q, r).forEach(target => {
            if (this.isValidHex(target.q, target.r) && 
                this.board[target.q][target.r] === 0) {
                moves.push({
                    from: {q, r},
                    to: {q: target.q, r: target.r},
                    type: 'jump'
                });
            }
        });

        return moves;
    }

    // 结束回合
    endTurn() {
        this.selectedHex = null;
        this.validMoves = [];
        this.draw();
        this.updateScores();

        if (this.isGameOver()) {
            this.handleGameOver();
            return;
        }

        // 切换到下一个玩家
        this.nextPlayer();

        // 如果下一个玩家是AI，执行AI移动
        if (this.isAIEnabled && this.aiPlayers.includes(this.currentPlayer)) {
            setTimeout(() => this.executeAIMove(), 500);
        }

        this.draw();
        this.updateTurnIndicator();
    }

    // 切换玩家
    nextPlayer() {
        let nextIndex = (this.players.indexOf(this.currentPlayer) + 1) % this.players.length;
        
        // 跳过没有棋子的玩家
        let attempts = 0;
        while (attempts < this.players.length) {
            const nextPlayer = this.players[nextIndex];
            const hasPieces = this.getPlayerCells(nextPlayer).length > 0;
            const hasMoves = this.getValidMoves(nextPlayer).length > 0;
            
            if (hasPieces && hasMoves) {
                this.currentPlayer = nextPlayer;
                return;
            }
            
            nextIndex = (nextIndex + 1) % this.players.length;
            attempts++;
        }
    }

    // 更新得分显示
    updateScores() {
        const scores = this.calculateScores();
        this.scores = scores;
        
        for (let i = 1; i <= 3; i++) {
            const scoreElement = document.getElementById(`player${i}-score`);
            if (scoreElement && this.players.includes(i)) {
                scoreElement.querySelector('.score').textContent = scores[i];
            }
        }
    }

    // 更新回合指示器
    updateTurnIndicator() {
        const indicator = document.getElementById('turn-indicator');
        const playerNames = ['', '玩家1', '玩家2', '玩家3'];
        indicator.textContent = `${playerNames[this.currentPlayer]} 的回合`;
        
        // 高亮当前玩家
        for (let i = 1; i <= 3; i++) {
            const scoreElement = document.getElementById(`player${i}-score`);
            if (scoreElement) {
                scoreElement.classList.toggle('active', i === this.currentPlayer);
            }
        }
    }

    // 处理游戏结束
    handleGameOver() {
        this.gameOver = true;
        const scores = this.calculateScores();

        // 找出获胜者
        let maxScore = 0;
        let winners = [];
        for (let player in scores) {
            if (scores[player] > maxScore) {
                maxScore = scores[player];
                winners = [player];
            } else if (scores[player] === maxScore) {
                winners.push(player);
            }
        }

        // 解谜模式：玩家获胜则更新关卡
        if (this.gameMode === 'puzzle' && winners.includes(1)) {
            this.completeLevel();
        }

        // 显示游戏结束界面
        this.showGameOverScreen(scores, winners);
    }

    // 完成关卡
    completeLevel() {
        // 支持字符串ID和数字ID
        const level = typeof this.currentLevel === 'string'
            ? this.levels.find(l => l.id === this.currentLevel)
            : this.levels[this.currentLevel - 1];

        if (level) {
            level.completed = true;
            level.stars = Math.max(level.stars, 1);

            const scores = this.calculateScores();
            const score1 = scores[1] || 0;
            const score2 = scores[2] || 0;
            const ratio = score2 > 0 ? score1 / score2 : score1;

            if (ratio >= 2) level.stars = 3;
            else if (ratio >= 1.5) level.stars = 2;

            // 自定义地图不需要解锁下一关
            // 预置关卡才解锁下一关
            if (!level.isCustom) {
                const nextLevel = this.levels[this.currentLevel];
                if (nextLevel) {
                    nextLevel.unlocked = true;
                }
            }
        }
    }

    // 显示游戏结束界面
    showGameOverScreen(scores, winners) {
        const finalScoresDiv = document.getElementById('final-scores');
        const winnerText = document.getElementById('winner-text');
        const playerNames = ['', '玩家1', '玩家2', '玩家3'];

        finalScoresDiv.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            if (this.players.includes(i)) {
                const scoreItem = document.createElement('div');
                scoreItem.className = 'final-score-item';
                scoreItem.innerHTML = `
                    <span style="color: ${this.cellColors[i]}">● ${playerNames[i]}</span>
                    <span>${scores[i]} 分</span>
                `;
                finalScoresDiv.appendChild(scoreItem);
            }
        }

        if (winners.length === 1) {
            winnerText.textContent = `${playerNames[winners[0]]} 获胜!`;
            winnerText.style.color = this.cellColors[winners[0]];
        } else {
            winnerText.textContent = '平局!';
            winnerText.style.color = '#666';
        }

        // 解谜模式显示星级
        const nextLevelBtn = document.getElementById('next-level');
        const starsAward = document.getElementById('level-stars-award');
        if (this.gameMode === 'puzzle' && winners.includes(1)) {
            const level = this.levels[this.currentLevel - 1];
            let starsHtml = '<div class="stars-award">获得星级: ';
            for (let i = 0; i < 3; i++) {
                starsHtml += `<span class="star ${i < level.stars ? '' : 'empty'}">★</span>`;
            }
            starsHtml += '</div>';
            starsAward.innerHTML = starsHtml;
            
            // 如果有下一关，显示下一关按钮
            const nextLevel = this.levels[this.currentLevel];
            if (nextLevel && nextLevel.unlocked) {
                nextLevelBtn.classList.remove('hidden');
                nextLevelBtn.onclick = () => {
                    this.loadLevel(this.currentLevel + 1);
                    window.gameController.showGameScreen();
                };
            } else {
                nextLevelBtn.classList.add('hidden');
            }
        } else {
            starsAward.innerHTML = '';
            nextLevelBtn.classList.add('hidden');
        }

        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('game-over').classList.remove('hidden');
    }

    // AI移动
    executeAIMove() {
        if (this.gameOver) return;

        const validMoves = this.getValidMoves(this.currentPlayer);
        if (validMoves.length === 0) {
            this.endTurn();
            return;
        }

        // 简单AI：选择获得最多棋子的移动
        let bestMove = null;
        let bestScore = -1;

        validMoves.forEach(move => {
            const score = this.evaluateMove(move);
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        });

        if (bestMove) {
            this.makeMove(bestMove);
            this.endTurn();
        }
    }

    // 评估移动得分
    evaluateMove(move) {
        const player = this.board[move.from.q][move.from.r];
        let score = 0;

        // 复制增加1个棋子
        if (move.type === 'clone') {
            score += 1;
        }

        // 计算转换的对手棋子数量
        const neighbors = this.getNeighbors(move.to.q, move.to.r);
        neighbors.forEach(n => {
            if (this.isValidHex(n.q, n.r) && 
                this.board[n.q][n.r] !== 0 && 
                this.board[n.q][n.r] !== player) {
                score += 1;
            }
        });

        return score;
    }

    // 设置游戏模式
    setMode(mode) {
        this.gameMode = mode;
        switch(mode) {
            case 'puzzle':
            case 'custom':
                this.isAIEnabled = true;
                this.aiPlayers = [2];
                this.threePlayerMode = false;
                this.players = [1, 2];
                break;
            case 'pvp':
                this.isAIEnabled = false;
                this.aiPlayers = [];
                this.threePlayerMode = false;
                this.players = [1, 2];
                break;
        }
    }

    // 开始新游戏
    startGame(boardRadius = 4) {
        // 如果是自定义地图，重新加载当前地图
        if (this.currentLevel && typeof this.currentLevel === 'string' && this.currentLevel.startsWith('custom_')) {
            const level = this.levels.find(l => l.id === this.currentLevel);
            if (level && level.isCustom && level.customBoard) {
                this.board = JSON.parse(JSON.stringify(level.customBoard));
                this.boardRadius = level.radius;
                this.currentPlayer = 1;
                this.selectedHex = null;
                this.validMoves = [];
                this.gameOver = false;

                this.resizeCanvas();
                this.draw();
                this.updateScores();
                this.updateTurnIndicator();
                return;
            }
        }

        this.initBoard(boardRadius);
        this.currentPlayer = 1;
        this.selectedHex = null;
        this.validMoves = [];
        this.gameOver = false;

        // 设置初始棋子位置
        this.setupInitialPieces();

        this.resizeCanvas();
        this.draw();
        this.updateScores();
        this.updateTurnIndicator();
    }

    // 设置初始棋子
    setupInitialPieces() {
        const r = this.boardRadius;
        
        // 玩家1的初始位置
        this.board[-r][0] = 1;
        this.board[r][0] = 1;
        this.board[0][-r] = 1;

        // 玩家2的初始位置
        this.board[-r][r] = 2;
        this.board[r][-r] = 2;
        this.board[0][r] = 2;

        // 玩家3的初始位置（3人模式）
        if (this.threePlayerMode) {
            this.board[0][0] = 3;
        }
    }

    // 调整画布大小
    resizeCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, 600);
        this.canvas.width = size;
        this.canvas.height = size;
        this.hexSize = size / (this.boardRadius * 2 + 1) / 2.5;
    }

    // 生成关卡
    generateLevels() {
        // 保存现有的自定义地图
        const customLevels = this.levels ? this.levels.filter(l => l.isCustom) : [];

        const levels = [
            { id: 1, name: '入门', difficulty: 1, mapType: 'classic', radius: 3, unlocked: true, completed: false, stars: 0 },
            { id: 2, name: '环形', difficulty: 1, mapType: 'ring', radius: 3, unlocked: true, completed: false, stars: 0 },
            { id: 3, name: '中心争夺', difficulty: 1, mapType: 'center', radius: 3, unlocked: true, completed: false, stars: 0 },
            { id: 4, name: '三路交锋', difficulty: 2, mapType: 'triangle', radius: 3, unlocked: true, completed: false, stars: 0 },
            { id: 5, name: '孤岛', difficulty: 2, mapType: 'islands', radius: 3, unlocked: false, completed: false, stars: 0 },
            { id: 6, name: '走廊', difficulty: 2, mapType: 'corridor', radius: 3, unlocked: false, completed: false, stars: 0 },
            { id: 7, name: '星形', difficulty: 3, mapType: 'star', radius: 4, unlocked: false, completed: false, stars: 0 },
            { id: 8, name: '迷宫', difficulty: 3, mapType: 'maze', radius: 4, unlocked: false, completed: false, stars: 0 },
            { id: 9, name: '堡垒', difficulty: 3, mapType: 'fortress', radius: 4, unlocked: false, completed: false, stars: 0 },
            { id: 10, name: '深渊', difficulty: 3, mapType: 'abyss', radius: 4, unlocked: false, completed: false, stars: 0 },
            { id: 11, name: '风暴', difficulty: 3, mapType: 'storm', radius: 4, unlocked: false, completed: false, stars: 0 },
            { id: 12, name: '终极', difficulty: 3, mapType: 'ultimate', radius: 4, unlocked: false, completed: false, stars: 0 }
        ];

        // 合并预置关卡和自定义地图
        this.levels = [...levels, ...customLevels];

        // 从localStorage加载自定义地图
        this.loadCustomMapsFromStorage();
    }

    // 从localStorage加载自定义地图
    loadCustomMapsFromStorage() {
        try {
            const savedMaps = JSON.parse(localStorage.getItem('hexxagonCustomMaps') || '{}');
            console.log('从localStorage加载自定义地图,数量:', Object.keys(savedMaps).length);

            Object.entries(savedMaps).forEach(([mapId, mapData]) => {
                const existingIndex = this.levels.findIndex(l => l.id === mapId);
                if (existingIndex === -1) {
                    this.levels.push({
                        id: mapData.id,
                        name: mapData.name,
                        difficulty: 1,
                        mapType: 'custom',
                        radius: mapData.radius,
                        customBoard: mapData.board,
                        unlocked: true,
                        completed: false,
                        stars: 0,
                        isCustom: true
                    });
                }
            });

            console.log('加载后总关卡数:', this.levels.length, '自定义地图数:', this.levels.filter(l => l.isCustom).length);
        } catch (err) {
            console.error('加载自定义地图失败:', err);
        }
    }

    // 地图配置
    mapLayouts = {
        classic: (r) => {
            return true;
        },
        ring: (r, q, s) => {
            const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
            return dist >= 1 && dist <= r;
        },
        center: (r, q, s) => {
            const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
            return dist <= 2 || dist >= r - 1;
        },
        triangle: (r, q, s) => {
            return q >= 0 || r >= 0 || s >= 0;
        },
        islands: (r, q, s) => {
            const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
            const centerX = Math.abs(q);
            const centerY = Math.abs(r);
            const centerZ = Math.abs(s);
            return dist <= 1 || (centerX >= r - 1 && centerY >= r - 1) || 
                   (centerY >= r - 1 && centerZ >= r - 1) || 
                   (centerZ >= r - 1 && centerX >= r - 1);
        },
        corridor: (r, q, s) => {
            return Math.abs(s) <= 1 || (Math.abs(q) <= 2 && Math.abs(r) <= 2);
        },
        star: (r, q, s) => {
            const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
            return dist <= 1 || (Math.abs(q) === 2 || Math.abs(r) === 2 || Math.abs(s) === 2);
        },
        maze: (r, q, s) => {
            if (Math.abs(q) <= 1 && Math.abs(r) <= 1 && Math.abs(s) <= 1) return true;
            if (q === 0 || r === 0 || s === 0) return true;
            return false;
        },
        fortress: (r, q, s) => {
            const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
            return dist <= 2 || (dist >= r - 2 && (q === 0 || r === 0 || s === 0));
        },
        abyss: (r, q, s) => {
            const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
            return dist === 0 || dist === r || (dist === r - 1 && (q % 2 === 0 || r % 2 === 0));
        },
        storm: (r, q, s) => {
            if (q === 0 && r === 0) return true;
            if (Math.abs(q + r + s) > 0 && (q + r + s) % 2 === 0) return true;
            return Math.max(Math.abs(q), Math.abs(r), Math.abs(s)) <= 2;
        },
        ultimate: (r, q, s) => {
            const dist = Math.max(Math.abs(q), Math.abs(r), Math.abs(s));
            return dist <= 1 || dist === r || 
                   (dist === Math.floor(r / 2) && (q % 3 === 0 || r % 3 === 0 || s % 3 === 0));
        }
    };

    // 根据地图类型初始化棋盘
    initBoard(radius = 4, mapType = 'classic') {
        this.boardRadius = radius;
        this.board = [];
        
        for (let q = -radius; q <= radius; q++) {
            this.board[q] = {};
            for (let r = -radius; r <= radius; r++) {
                const s = -q - r;
                if (Math.abs(s) <= radius) {
                    const layout = this.mapLayouts[mapType];
                    if (layout && layout(radius, q, s)) {
                        this.board[q][r] = 0;
                    }
                }
            }
        }
    }

    // 加载关卡
    loadLevel(levelId) {
        console.log('=== 开始加载关卡 ===');
        console.log('levelId:', levelId, '类型:', typeof levelId);

        let level;

        // 如果levelId是undefined,说明关卡数据有问题
        if (levelId === undefined || levelId === null) {
            console.error('❌ levelId 是 undefined 或 null!');
            console.error('请检查关卡数据,可能某个关卡缺少 id 字段');
            return false;
        }

        // 支持字符串ID(自定义地图)和数字ID(预置关卡)
        if (typeof levelId === 'string') {
            level = this.levels.find(l => l.id === levelId);
        } else {
            level = this.levels[levelId - 1];
        }

        console.log('找到关卡:', level);

        // 检查关卡是否有效
        if (!level) {
            console.error('❌ 关卡未找到, levelId:', levelId);
            console.error('当前所有关卡:');
            this.levels.forEach((l, i) => {
                console.log(`  ${i + 1}. id=${l.id}, name=${l.name}, isCustom=${l.isCustom}`);
            });
            return false;
        }

        console.log('关卡详情:', {
            id: level.id,
            name: level.name,
            isCustom: level.isCustom,
            hasCustomBoard: !!level.customBoard,
            unlocked: level.unlocked
        });

        if (!level.unlocked) {
            console.error('❌ 关卡未解锁:', levelId, level);
            return false;
        }

        this.currentLevel = levelId;

        // 如果是自定义地图，直接加载保存的棋盘
        if (level.isCustom && level.customBoard) {
            console.log('✅ 加载自定义地图:', level.name);
            console.log('棋盘数据:', JSON.stringify(level.customBoard).substring(0, 200) + '...');
            this.board = JSON.parse(JSON.stringify(level.customBoard));
            this.boardRadius = level.radius;
        } else {
            // 预置关卡使用地图类型生成
            console.log('⚠️ 加载预置关卡:', level.name, 'type:', level.mapType);
            this.initBoard(level.radius, level.mapType);
            this.setupInitialPiecesForMap(level.mapType);
        }

        this.currentPlayer = 1;
        this.selectedHex = null;
        this.validMoves = [];
        this.gameOver = false;

        this.resizeCanvas();
        this.draw();
        this.updateScores();
        this.updateTurnIndicator();

        console.log('✅ 关卡加载完成,当前棋盘格子数:', this.countEmptyCells());
        console.log('=== 关卡加载结束 ===');

        return true;
    }

    // 根据地图类型设置初始棋子
    setupInitialPiecesForMap(mapType) {
        const r = this.boardRadius;
        
        const setups = {
            classic: () => {
                this.board[-r][0] = 1;
                this.board[r][0] = 1;
                this.board[0][-r] = 1;
                this.board[-r][r] = 2;
                this.board[r][-r] = 2;
                this.board[0][r] = 2;
            },
            ring: () => {
                this.board[-r][r] = 1;
                this.board[r][-r] = 1;
                this.board[0][r] = 1;
                this.board[-r][0] = 2;
                this.board[r][0] = 2;
                this.board[0][-r] = 2;
            },
            center: () => {
                this.board[0][0] = 1;
                this.board[-r][r] = 1;
                this.board[r][-r] = 1;
                this.board[0][r] = 2;
                this.board[-r][0] = 2;
                this.board[0][-r] = 2;
            },
            triangle: () => {
                this.board[0][0] = 1;
                this.board[r][0] = 1;
                this.board[0][-r] = 1;
                this.board[-r][r] = 2;
                this.board[r][-r] = 2;
                this.board[0][r] = 2;
            },
            islands: () => {
                this.board[0][0] = 1;
                this.board[-r][-r] = 1;
                this.board[r][r] = 1;
                this.board[-r][r] = 2;
                this.board[r][-r] = 2;
                this.board[0][r] = 2;
            },
            corridor: () => {
                this.board[0][-r] = 1;
                this.board[0][-1] = 1;
                this.board[0][1] = 1;
                this.board[0][r] = 2;
                this.board[0][-r/2] = 2;
                this.board[0][r/2] = 2;
            },
            star: () => {
                this.board[0][0] = 1;
                this.board[-r][0] = 1;
                this.board[r][0] = 1;
                this.board[0][-r] = 1;
                this.board[0][r] = 1;
                this.board[-r][r] = 2;
                this.board[r][-r] = 2;
                this.board[-r/2][r/2] = 2;
                this.board[r/2][-r/2] = 2;
            },
            maze: () => {
                this.board[0][-r] = 1;
                this.board[0][-r/2] = 1;
                this.board[0][0] = 1;
                this.board[0][r] = 2;
                this.board[0][r/2] = 2;
                this.board[0][0] = 2;
            },
            fortress: () => {
                this.board[-r][-r] = 1;
                this.board[r][r] = 1;
                this.board[0][0] = 1;
                this.board[-r][r] = 2;
                this.board[r][-r] = 2;
                this.board[0][r] = 2;
            },
            abyss: () => {
                this.board[-r][0] = 1;
                this.board[r][0] = 1;
                this.board[0][-r] = 1;
                this.board[0][r] = 2;
                this.board[-r][r] = 2;
                this.board[r][-r] = 2;
            },
            storm: () => {
                this.board[0][0] = 1;
                this.board[-r][0] = 1;
                this.board[0][-r] = 1;
                this.board[0][r] = 2;
                this.board[r][0] = 2;
                this.board[r][-r] = 2;
            },
            ultimate: () => {
                this.board[-r][-r] = 1;
                this.board[r][r] = 1;
                this.board[0][0] = 1;
                this.board[-r][r] = 2;
                this.board[r][-r] = 2;
                this.board[0][r] = 2;
            }
        };

        if (setups[mapType]) {
            setups[mapType]();
        } else {
            setups.classic();
        }
    }
}

// 游戏控制器
class GameController {
    constructor() {
        this.game = new Hexxagon('game-canvas');
        this.currentMode = 'puzzle';
        this.init();
    }

    init() {
        // 绑定菜单按钮事件
        document.querySelectorAll('.menu-btn[data-mode]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.showModeScreen(btn.dataset.mode);
            });
        });

        // 绑定返回按钮事件
        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.showMainMenu();
        });

        document.getElementById('back-to-mode').addEventListener('click', () => {
            this.showModeScreen(this.currentMode);
        });

        document.getElementById('back-to-menu-end').addEventListener('click', () => {
            this.showMainMenu();
        });

        document.getElementById('play-again').addEventListener('click', () => {
            this.startGame();
        });

        document.getElementById('restart-btn').addEventListener('click', () => {
            this.startGame();
        });

        // 响应式调整
        window.addEventListener('resize', () => {
            if (this.game) {
                this.game.resizeCanvas();
                this.game.draw();
            }
        });

        // 生成关卡数据
        this.game.generateLevels();
    }

    showMainMenu() {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('main-menu').classList.remove('hidden');
    }

    showModeScreen(mode) {
        this.currentMode = mode;
        this.game.setMode(mode);

        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));

        // 自定义地图模式显示编辑器
        if (mode === 'custom') {
            document.getElementById('custom-map-screen').classList.remove('hidden');
            this.initCustomMapEditor();
            return;
        }

        document.getElementById('mode-screen').classList.remove('hidden');

        const title = document.getElementById('mode-title');
        const titles = {
            'puzzle': '解谜模式',
            'pvp': 'PVP 模式'
        };
        title.textContent = titles[mode];

        this.renderLevelList();
    }

    renderLevelList() {
        console.log('=== 渲染关卡列表 ===');
        console.log('当前模式:', this.currentMode);
        console.log('总关卡数:', this.game.levels.length);
        console.log('自定义地图数:', this.game.levels.filter(l => l.isCustom).length);

        const list = document.getElementById('level-list');
        list.innerHTML = '';

        if (this.currentMode === 'pvp') {
            // PVP模式直接开始游戏
            const startBtn = document.createElement('div');
            startBtn.className = 'level-item';
            startBtn.innerHTML = '<h3>开始对战</h3><p>2人对战模式</p>';
            startBtn.addEventListener('click', () => this.startGame());
            list.appendChild(startBtn);
            return;
        }

        // 显示关卡列表
        this.game.levels.forEach((level, index) => {
            console.log(`关卡 ${index + 1}:`, {
                id: level.id,
                name: level.name,
                isCustom: level.isCustom,
                hasCustomBoard: !!level.customBoard,
                unlocked: level.unlocked
            });

            const item = document.createElement('div');
            item.className = `level-item ${level.unlocked ? '' : 'locked'}`;

            let starsHtml = '';
            for (let i = 0; i < 3; i++) {
                starsHtml += `<span class="star ${i < level.stars ? '' : 'empty'}">★</span>`;
            }

            let deleteBtnHtml = '';
            if (level.isCustom) {
                deleteBtnHtml = `<button class="delete-level-btn" data-id="${level.id}">✕</button>`;
            }

            item.innerHTML = `
                <div class="level-content">
                    <h3>${level.name} ${level.isCustom ? '<span class="custom-badge">自定义</span>' : ''}</h3>
                    <div class="level-stars">${starsHtml}</div>
                </div>
                ${deleteBtnHtml}
            `;

            if (level.unlocked) {
                item.querySelector('.level-content').addEventListener('click', () => {
                    console.log('点击关卡:', level.id, level.name, '索引:', index);
                    // 优先使用 id,如果 id 不存在则使用索引+1
                    const levelId = level.id || (index + 1);
                    console.log('使用的 levelId:', levelId);
                    if (this.game.loadLevel(levelId)) {
                        this.showGameScreen();
                    }
                });
            }

            // 自定义地图的删除按钮
            const deleteBtn = item.querySelector('.delete-level-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.deleteCustomLevel(level.id);
                });
            }

            list.appendChild(item);
        });

        console.log('=== 关卡列表渲染完成 ===');
    }

    startGame() {
        if (this.currentMode === 'puzzle' && this.game.currentLevel > 0) {
            const level = this.game.levels[this.game.currentLevel - 1];
            this.game.loadLevel(this.game.currentLevel);
        } else {
            const radius = this.currentMode === 'puzzle' ? 3 : 4;
            this.game.startGame(radius);
        }
        this.showGameScreen();
    }

    showGameScreen() {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        document.getElementById('game-screen').classList.remove('hidden');

        // 显示或隐藏玩家3
        const player3Score = document.getElementById('player3-score');
        if (this.game.threePlayerMode) {
            player3Score.classList.remove('hidden');
        } else {
            player3Score.classList.add('hidden');
        }

        // 显示游戏信息
        const info = document.getElementById('game-info');
        const modeNames = {
            'puzzle': '解谜模式',
            'custom': '自定义地图',
            'pvp': 'PVP 模式'
        };
        info.textContent = `${modeNames[this.currentMode]}`;

        // 如果是AI开始，延迟执行
        if (this.game.isAIEnabled && this.game.aiPlayers.includes(this.game.currentPlayer)) {
            setTimeout(() => this.game.executeAIMove(), 500);
        }
    }

    // 初始化自定义地图编辑器
    initCustomMapEditor() {
        this.customEditor = {
            canvas: document.getElementById('custom-map-canvas'),
            ctx: document.getElementById('custom-map-canvas').getContext('2d'),
            board: {},
            radius: 4,
            selectedCell: null
        };

        // 绑定事件
        document.getElementById('back-to-menu-custom').addEventListener('click', () => {
            this.showMainMenu();
        });

        document.getElementById('generate-map').addEventListener('click', () => {
            this.generateCustomMap();
        });

        document.getElementById('clear-all').addEventListener('click', () => {
            this.clearCustomMap();
        });

        document.getElementById('save-map').addEventListener('click', () => {
            this.saveCustomMap();
        });

        document.getElementById('load-saved-maps').addEventListener('click', () => {
            this.showSavedMaps();
        });

        document.getElementById('import-map').addEventListener('click', () => {
            document.getElementById('map-file-input').click();
        });

        document.getElementById('map-file-input').addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.importMapFromFile(file);
            }
            e.target.value = ''; // 重置文件输入
        });

        this.customEditor.canvas.addEventListener('click', (e) => {
            this.handleCustomMapClick(e);
        });

        this.customEditor.canvas.addEventListener('mousemove', (e) => {
            this.handleCustomMapMouseMove(e);
        });

        // 初始化画布
        this.resizeCustomMapCanvas();
        this.generateCustomMap();
    }

    // 调整自定义地图画布大小
    resizeCustomMapCanvas() {
        const container = this.customEditor.canvas.parentElement;
        const size = Math.min(container.clientWidth, 600);
        this.customEditor.canvas.width = size;
        this.customEditor.canvas.height = size;
        this.customEditor.hexSize = size / (this.customEditor.radius * 2 + 1) / 2.5;
    }

    // 生成自定义地图
    generateCustomMap() {
        const mapType = document.getElementById('map-type').value;
        const radius = parseInt(document.getElementById('map-radius').value);
        this.customEditor.radius = radius;
        this.customEditor.board = {};

        // 使用游戏中的地图布局生成
        for (let q = -radius; q <= radius; q++) {
            this.customEditor.board[q] = {};
            for (let r = -radius; r <= radius; r++) {
                const s = -q - r;
                if (Math.abs(s) <= radius) {
                    const layout = this.game.mapLayouts[mapType];
                    if (layout && layout(radius, q, s)) {
                        this.customEditor.board[q][r] = 0;
                    }
                }
            }
        }

        this.resizeCustomMapCanvas();
        this.drawCustomMap();
    }

    // 清空自定义地图
    clearCustomMap() {
        this.customEditor.board = {};
        this.drawCustomMap();
    }

    // 绘制自定义地图
    drawCustomMap() {
        const ctx = this.customEditor.ctx;
        const canvas = this.customEditor.canvas;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 绘制六边形
        for (let q in this.customEditor.board) {
            for (let r in this.customEditor.board[q]) {
                const pos = this.hexToPixelCustom(parseInt(q), parseInt(r));
                const value = this.customEditor.board[q][r];
                this.drawHexCustom(pos.x, pos.y, value, parseInt(q), parseInt(r));
            }
        }
    }

    // 六边形坐标转像素坐标
    hexToPixelCustom(q, r) {
        const x = this.customEditor.hexSize * (3/2 * q);
        const y = this.customEditor.hexSize * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
        return { x: x + this.customEditor.canvas.width/2, y: y + this.customEditor.canvas.height/2 };
    }

    // 像素坐标转六边形坐标
    pixelToHexCustom(x, y) {
        const cx = x - this.customEditor.canvas.width/2;
        const cy = y - this.customEditor.canvas.height/2;
        const q = (2/3 * cx) / this.customEditor.hexSize;
        const r = (-1/3 * cx + Math.sqrt(3)/3 * cy) / this.customEditor.hexSize;
        return this.roundHexCustom(q, r);
    }

    // 四舍五入六边形坐标
    roundHexCustom(q, r) {
        let s = -q - r;
        let rq = Math.round(q);
        let rr = Math.round(r);
        let rs = Math.round(s);

        const qDiff = Math.abs(rq - q);
        const rDiff = Math.abs(rr - r);
        const sDiff = Math.abs(rs - s);

        if (qDiff > rDiff && qDiff > sDiff) {
            rq = -rr - rs;
        } else if (rDiff > sDiff) {
            rr = -rq - rs;
        }

        return { q: rq, r: rr };
    }

    // 绘制单个六边形
    drawHexCustom(x, y, value, q, r) {
        const ctx = this.customEditor.ctx;
        const colors = {
            0: '#e8e8e8',
            1: '#ff6b6b',
            2: '#4ecdc4'
        };

        ctx.fillStyle = colors[value] || '#e8e8e8';
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;

        this.drawHexPathCustom(ctx, x, y);
        ctx.fill();
        ctx.stroke();

        // 高亮鼠标悬停
        if (this.customEditor.selectedCell &&
            this.customEditor.selectedCell.q === q &&
            this.customEditor.selectedCell.r === r) {
            ctx.strokeStyle = '#ff0';
            ctx.lineWidth = 3;
            this.drawHexPathCustom(ctx, x, y);
            ctx.stroke();
        }
    }

    // 绘制六边形路径
    drawHexPathCustom(ctx, x, y) {
        const size = this.customEditor.hexSize;
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            // 使用0度角起始,使上下边水平
            const angle = (Math.PI / 3) * i;
            const hx = x + size * Math.cos(angle);
            const hy = y + size * Math.sin(angle);
            if (i === 0) {
                ctx.moveTo(hx, hy);
            } else {
                ctx.lineTo(hx, hy);
            }
        }
        ctx.closePath();
    }

    // 处理自定义地图点击
    handleCustomMapClick(e) {
        const rect = this.customEditor.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const hex = this.pixelToHexCustom(x, y);

        const editMode = document.getElementById('edit-mode').value;

        if (editMode === 'add') {
            if (!this.customEditor.board[hex.q]) {
                this.customEditor.board[hex.q] = {};
            }
            this.customEditor.board[hex.q][hex.r] = 0;
        } else if (editMode === 'remove') {
            if (this.customEditor.board[hex.q]) {
                delete this.customEditor.board[hex.q][hex.r];
                if (Object.keys(this.customEditor.board[hex.q]).length === 0) {
                    delete this.customEditor.board[hex.q];
                }
            }
        } else if (editMode === 'player1' || editMode === 'player2') {
            if (this.customEditor.board[hex.q] && this.customEditor.board[hex.q][hex.r] !== undefined) {
                const player = editMode === 'player1' ? 1 : 2;
                this.customEditor.board[hex.q][hex.r] = player;
            }
        }

        this.drawCustomMap();
    }

    // 处理自定义地图鼠标移动
    handleCustomMapMouseMove(e) {
        const rect = this.customEditor.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const hex = this.pixelToHexCustom(x, y);

        if (this.customEditor.board[hex.q] && this.customEditor.board[hex.q][hex.r] !== undefined) {
            this.customEditor.selectedCell = hex;
        } else {
            this.customEditor.selectedCell = null;
        }
        this.drawCustomMap();
    }

    // 保存自定义地图
    saveCustomMap() {
        console.log('=== 保存自定义地图 ===');

        const mapName = document.getElementById('map-name').value || '未命名地图';
        console.log('地图名称:', mapName);
        console.log('编辑器棋盘:', JSON.stringify(this.customEditor.board).substring(0, 200) + '...');

        const savedMaps = JSON.parse(localStorage.getItem('hexxagonCustomMaps') || '{}');

        const mapData = {
            id: 'custom_' + Date.now(),
            name: mapName,
            radius: this.customEditor.radius,
            board: JSON.parse(JSON.stringify(this.customEditor.board)),
            createdAt: new Date().toISOString(),
            isCustom: true
        };

        console.log('地图数据:', {
            id: mapData.id,
            name: mapData.name,
            radius: mapData.radius,
            cellsCount: this.countCells(mapData.board)
        });

        savedMaps[mapData.id] = mapData;
        localStorage.setItem('hexxagonCustomMaps', JSON.stringify(savedMaps));
        console.log('已保存到localStorage');

        // 导出为JSON文件供下载
        this.exportMapToFile(mapData);

        // 添加到解谜关卡列表
        this.addCustomMapToLevels(mapData);

        console.log('=== 地图保存完成 ===');
        alert(`地图 "${mapName}" 已保存! 并已添加到解谜模式关卡列表中。`);
    }

    // 导出地图为JSON文件
    exportMapToFile(mapData) {
        const jsonStr = JSON.stringify(mapData, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${mapData.name.replace(/\s+/g, '_')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 添加自定义地图到关卡列表
    addCustomMapToLevels(mapData) {
        const existingIndex = this.game.levels.findIndex(l => l.id === mapData.id);
        if (existingIndex === -1) {
            this.game.levels.push({
                id: mapData.id,
                name: mapData.name,
                difficulty: 1,
                mapType: 'custom',
                radius: mapData.radius,
                customBoard: mapData.board,
                unlocked: true,
                completed: false,
                stars: 0,
                isCustom: true
            });
            console.log('自定义地图已添加到关卡列表:', mapData.name);
        } else {
            // 更新现有地图
            this.game.levels[existingIndex] = {
                id: mapData.id,
                name: mapData.name,
                difficulty: 1,
                mapType: 'custom',
                radius: mapData.radius,
                customBoard: mapData.board,
                unlocked: true,
                completed: this.game.levels[existingIndex].completed,
                stars: this.game.levels[existingIndex].stars,
                isCustom: true
            };
            console.log('自定义地图已更新:', mapData.name);
        }
    }

    // 显示已保存的地图
    showSavedMaps() {
        const savedMaps = JSON.parse(localStorage.getItem('hexxagonCustomMaps') || '{}');
        const mapsList = document.getElementById('saved-maps-list');

        if (Object.keys(savedMaps).length === 0) {
            mapsList.innerHTML = '<p class="no-maps">还没有保存的地图</p>';
            return;
        }

        mapsList.innerHTML = '';
        Object.entries(savedMaps).forEach(([mapId, mapData]) => {
            const mapItem = document.createElement('div');
            mapItem.className = 'saved-map-item';
            mapItem.innerHTML = `
                <div class="map-info">
                    <h4>${mapData.name}</h4>
                    <p>半径: ${mapData.radius} | 格子数: ${this.countCells(mapData.board)}</p>
                    <p style="font-size: 0.8rem; color: #999;">${new Date(mapData.createdAt).toLocaleString()}</p>
                </div>
                <div class="map-actions">
                    <button class="map-btn load-btn" data-id="${mapId}">加载</button>
                    <button class="map-btn play-btn" data-id="${mapId}">游玩</button>
                    <button class="map-btn export-btn" data-id="${mapId}">导出</button>
                    <button class="map-btn delete-btn" data-id="${mapId}">删除</button>
                </div>
            `;
            mapsList.appendChild(mapItem);
        });

        // 绑定按钮事件
        mapsList.querySelectorAll('.load-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.loadCustomMap(e.target.dataset.id);
            });
        });

        mapsList.querySelectorAll('.play-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.playCustomMap(e.target.dataset.id);
            });
        });

        mapsList.querySelectorAll('.export-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mapData = savedMaps[e.target.dataset.id];
                if (mapData) {
                    this.exportMapToFile(mapData);
                }
            });
        });

        mapsList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.deleteCustomMap(e.target.dataset.id);
            });
        });
    }

    // 导入地图文件
    importMapFromFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const mapData = JSON.parse(e.target.result);
                if (mapData.name && mapData.radius && mapData.board) {
                    mapData.id = 'custom_' + Date.now();
                    mapData.isCustom = true;

                    // 保存到localStorage
                    const savedMaps = JSON.parse(localStorage.getItem('hexxagonCustomMaps') || '{}');
                    savedMaps[mapData.id] = mapData;
                    localStorage.setItem('hexxagonCustomMaps', JSON.stringify(savedMaps));

                    // 添加到关卡列表
                    this.addCustomMapToLevels(mapData);

                    alert(`地图 "${mapData.name}" 导入成功! 并已添加到解谜模式关卡列表中。`);
                    this.showSavedMaps();
                } else {
                    alert('无效的地图文件格式!');
                }
            } catch (err) {
                alert('导入失败: ' + err.message);
            }
        };
        reader.readAsText(file);
    }

    // 计算格子数量
    countCells(board) {
        let count = 0;
        for (let q in board) {
            for (let r in board[q]) {
                count++;
            }
        }
        return count;
    }

    // 加载自定义地图到编辑器
    loadCustomMap(mapId) {
        const savedMaps = JSON.parse(localStorage.getItem('hexxagonCustomMaps') || '{}');
        const mapData = savedMaps[mapId];

        if (mapData) {
            this.customEditor.radius = mapData.radius;
            this.customEditor.board = JSON.parse(JSON.stringify(mapData.board));
            document.getElementById('map-name').value = mapData.name;
            this.resizeCustomMapCanvas();
            this.drawCustomMap();
        }
    }

    // 游玩自定义地图
    playCustomMap(mapId) {
        const savedMaps = JSON.parse(localStorage.getItem('hexxagonCustomMaps') || '{}');
        const mapData = savedMaps[mapId];

        if (mapData) {
            // 加载地图到游戏
            this.game.board = JSON.parse(JSON.stringify(mapData.board));
            this.game.boardRadius = mapData.radius;
            this.game.currentLevel = mapId; // 设置当前关卡ID为自定义地图ID
            this.game.currentPlayer = 1;
            this.game.selectedHex = null;
            this.game.validMoves = [];
            this.game.gameOver = false;

            this.game.resizeCanvas();
            this.game.draw();
            this.game.updateScores();
            this.game.updateTurnIndicator();
            this.showGameScreen();
        }
    }

    // 删除自定义地图
    deleteCustomMap(mapId) {
        if (confirm('确定要删除这个地图吗?')) {
            const savedMaps = JSON.parse(localStorage.getItem('hexxagonCustomMaps') || '{}');
            delete savedMaps[mapId];
            localStorage.setItem('hexxagonCustomMaps', JSON.stringify(savedMaps));
            this.showSavedMaps();
        }
    }

    // 从关卡列表中删除自定义地图
    deleteCustomLevel(levelId) {
        if (confirm('确定要从解谜模式中删除这个自定义地图吗?')) {
            // 从关卡列表中删除
            this.game.levels = this.game.levels.filter(l => l.id !== levelId);

            // 从localStorage中删除
            const savedMaps = JSON.parse(localStorage.getItem('hexxagonCustomMaps') || '{}');
            delete savedMaps[levelId];
            localStorage.setItem('hexxagonCustomMaps', JSON.stringify(savedMaps));

            // 刷新关卡列表
            this.renderLevelList();
        }
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    window.gameController = new GameController();
});
