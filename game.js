class Game {
    constructor() {
        this.player = new ZhaoYun();
        this.level = 1;
        this.gridSize = 3;
        this.grid = [];
        this.gameOver = false;

        this.gameBoard = document.getElementById('game-board');
        this.infoPanel = document.getElementById('info-panel');

        document.getElementById('start-game').addEventListener('click', () => this.startGame());

        this.playerLevel = 1;

        this.skillsUsed = {
            attack: false,
            heal: false,
            boost: false
        };
        
        document.getElementById('attack-btn').addEventListener('click', () => this.useSkill('attack'));
        document.getElementById('heal-btn').addEventListener('click', () => this.useSkill('heal'));
        document.getElementById('boost-btn').addEventListener('click', () => this.useSkill('boost'));

        this.sweepAttackMultiplier = 0.6; // 初始天翔之龙倍率
    }

    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        this.initLevel();
        this.renderGrid();
        this.updateInfoPanel();
        this.updateSkillButtons();
    }

    initLevel() {
        this.grid = new Array(this.gridSize).fill(null).map(() => new Array(this.gridSize).fill(null));
        
        let playerPos = this.getRandomCell();
        this.grid[playerPos.y][playerPos.x] = this.player;

        let exitPos = this.getFarthestCell(playerPos);
        this.grid[exitPos.y][exitPos.x] = new Exit();

        this.placeEnemiesAndItems();

        this.fillEmptyCells();
    }

    getRandomCell() {
        let x = Math.floor(Math.random() * this.gridSize);
        let y = Math.floor(Math.random() * this.gridSize);
        return {x, y};
    }

    getFarthestCell(playerPos) {
        let maxDistance = 0;
        let farthestCell = null;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                let distance = Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    farthestCell = {x, y};
                }
            }
        }

        return farthestCell;
    }

    getRandomEmptyCell() {
        let emptyCells = [];
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] === null) {
                    emptyCells.push({x, y});
                }
            }
        }
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    generateEnemy() {
        const enemyType = Math.random();
        if (enemyType < 0.6) {
            return new Infantry(this.playerLevel);
        } else if (enemyType < 0.9) {
            return new Archer(this.playerLevel);
        } else {
            return new Boss(this.playerLevel);
        }
    }

    generateItem() {
        const itemType = Math.random();
        if (itemType < 0.4) {
            return new HealthPotion();
        } else if (itemType < 0.7) {
            return new AttackBoost();
        } else {
            return new DefenseBoost();
        }
    }

    placeEnemiesAndItems() {
        const totalCells = this.gridSize * this.gridSize;
        const enemiesToPlace = Math.floor(totalCells * 0.3);
        const itemsToPlace = Math.floor(Math.random() * (this.gridSize + 5 - (this.gridSize - 1) + 1)) + (this.gridSize - 1);

        for (let i = 0; i < itemsToPlace; i++) {
            let pos = this.getRandomEmptyCell();
            if (pos) {
                this.grid[pos.y][pos.x] = this.generateItem();
                this.markAdjacentCells(pos.x, pos.y);
            }
        }

        for (let i = 0; i < enemiesToPlace; i++) {
            let pos = this.getRandomEmptyCell();
            if (pos) this.grid[pos.y][pos.x] = this.generateEnemy();
        }
    }

    markAdjacentCells(x, y) {
        const directions = [
            {dx: -1, dy: 0}, {dx: 1, dy: 0},
            {dx: 0, dy: -1}, {dx: 0, dy: 1}
        ];

        for (let dir of directions) {
            const newX = x + dir.dx;
            const newY = y + dir.dy;
            if (this.isValidCell(newX, newY) && this.grid[newY][newX] === null) {
                this.grid[newY][newX] = 'blocked';
            }
        }
    }

    isValidCell(x, y) {
        return x >= 0 && x < this.gridSize && y >= 0 && y < this.gridSize;
    }

    fillEmptyCells() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] === null || this.grid[y][x] === 'blocked') {
                    this.grid[y][x] = this.generateEnemy();
                }
            }
        }
    }

    renderGrid() {
        this.gameBoard.innerHTML = '';
        const gameBoardSize = Math.min(window.innerWidth * 0.95, window.innerHeight * 0.6);
        this.gameBoard.style.width = `${gameBoardSize}px`;
        this.gameBoard.style.height = `${gameBoardSize}px`;
        const cellSize = gameBoardSize / this.gridSize - 2;

        this.gameBoard.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        this.gameBoard.style.gridTemplateRows = `repeat(${this.gridSize}, 1fr)`;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                const content = this.grid[y][x];
                
                if (content instanceof ZhaoYun) {
                    cell.style.backgroundColor = '#1E90FF';
                } else if (content instanceof Character) {
                    cell.style.backgroundColor = 'lightcoral';
                } else if (content instanceof Item && !(content instanceof Exit)) {
                    cell.style.backgroundColor = 'lightgreen';
                } else if (content instanceof Exit) {
                    cell.style.backgroundColor = 'gold';
                } else {
                    cell.style.backgroundColor = 'white';
                }

                if (content) {
                    cell.innerHTML = `
                        <div class="cell-icon">${content.icon}</div>
                        ${content instanceof Character ? `
                            <div class="cell-stats">
                                <span>❤️${content.health}</span>
                                <span>⚔️${content.attack}</span>
                                <span>🛡️${content.defense}</span>
                            </div>
                        ` : ''}
                    `;
                }

                cell.addEventListener('click', () => this.handleCellClick(x, y));
                this.gameBoard.appendChild(cell);
            }
        }
    }

    updateInfoPanel() {
        this.infoPanel.innerHTML = `
            <h3>长坂坡</h3>
            <div class="info-grid">
                <div>等级: ${this.player.level}</div>
                <div>生命值: ${this.player.health}/${this.player.maxHealth}</div>
                <div>攻击力: ${this.player.attack}</div>
                <div>防御力: ${this.player.defense}/${this.player.maxDefense}</div>
                <div>经验值: ${this.player.exp}/${this.player.level * 100}</div>
                <div>当前关卡: ${this.level}</div>
            </div>
        `;
    }

    handleCellClick(x, y) {
        const clickedContent = this.grid[y][x];
        const playerPos = this.findPlayer();

        if (!playerPos) return;

        const dx = Math.abs(x - playerPos.x);
        const dy = Math.abs(y - playerPos.y);

        if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
            if (clickedContent instanceof Character && !(clickedContent instanceof ZhaoYun)) {
                const battleResult = this.battle(this.player, clickedContent);
                const resultDiv = document.createElement('div');
                resultDiv.innerHTML = battleResult;
                alert(resultDiv.innerText);
                if (clickedContent.health <= 0) {
                    this.grid[y][x] = this.player;
                    this.grid[playerPos.y][playerPos.x] = this.generateEnemy();
                }
            } else if (clickedContent instanceof Item && !(clickedContent instanceof Exit)) {
                clickedContent.apply(this.player);
                alert(`赵云使用了${clickedContent.type === 'health' ? '生命药水' : clickedContent.type === 'attack' ? '攻击增强' : '防御增强'}！`);
                this.grid[y][x] = this.player;
                this.grid[playerPos.y][playerPos.x] = this.generateEnemy();
            } else if (clickedContent instanceof Exit) {
                this.nextLevel();
                return;
            } else {
                this.grid[y][x] = this.player;
                this.grid[playerPos.y][playerPos.x] = this.generateEnemy();
            }

            this.renderGrid();
            this.updateInfoPanel();
            this.checkGameOver();
        }
    }

    battle(attacker, defender) {
        const damage = attacker.attack;  // 直接使用攻击力，而不是调用 attack 方法
        const actualDamage = defender.takeDamage(damage);
        let result = '';

        if (actualDamage === 0) {
            result = `${defender.type}<span style="color: #1E90FF;">闪避</span>了攻击！`;
        } else {
            if (Math.random() < attacker.critRate) {
                result = `${attacker.type}打出了<span style="color: #FF4500;">暴击</span>，对${defender.type}造成了${actualDamage}点伤害！`;
            } else {
                result = `${attacker.type}对${defender.type}造成了${actualDamage}点伤害！`;
            }
        }
        
        if (defender.health <= 0) {
            result += `<br>${defender.type}被击败了！`;
            if (defender instanceof ZhaoYun) {
                this.gameOver = true;
                result += "<br>游戏结束！";
            } else {
                const expGained = 10;
                this.player.gainExp(expGained);
                result += `<br>赵云获得了${expGained}点经验值！`;
            }
        } else {
            // 敌人反击
            const counterDamage = defender.attack;
            const actualCounterDamage = attacker.takeDamage(counterDamage);
            if (actualCounterDamage === 0) {
                result += `<br>${attacker.type}<span style="color: #1E90FF;">闪避</span>了反击！`;
            } else {
                if (Math.random() < defender.critRate) {
                    result += `<br>${defender.type}打出了<span style="color: #FF4500;">暴击</span>，反击对${attacker.type}造成了${actualCounterDamage}点伤害！`;
                } else {
                    result += `<br>${defender.type}反击，对${attacker.type}造成了${actualCounterDamage}点伤害！`;
                }
            }
            
            if (attacker.health <= 0) {
                this.gameOver = true;
                result += "<br>赵云被击败了，游戏结束！";
            }
        }
        
        return result;
    }

    findPlayer() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] instanceof ZhaoYun) {
                    return {x, y};
                }
            }
        }
        return null;
    }

    nextLevel() {
        this.level++;
        this.gridSize++;
        this.playerLevel = Math.floor((this.level + 1) / 2);
        this.skillsUsed = {
            attack: false,
            heal: false,
            boost: false
        };
        this.initLevel();
        this.renderGrid();
        this.updateInfoPanel();
        this.updateSkillButtons();
    }

    checkGameOver() {
        if (this.gameOver) {
            alert("游戏结束！");
            location.reload(); // 重新加载页面以重启游戏
        }
    }

    useSkill(skillType) {
        if (this.skillsUsed[skillType]) {
            alert('这个技能在本关卡已经使用过了！');
            return;
        }

        let message = '';
        switch(skillType) {
            case 'attack':
                message = this.tianXiangLong();
                break;
            case 'heal':
                message = this.poYunLong();
                break;
            case 'boost':
                message = this.jingLeiLong();
                break;
        }

        this.skillsUsed[skillType] = true;
        this.updateSkillButtons();
        alert(message);
        this.renderGrid();
        this.updateInfoPanel();
        this.checkGameOver();
    }

    tianXiangLong() {
        const playerPos = this.findPlayer();
        let enemiesHit = 0;
        const directions = [
            {dx: -1, dy: 0}, {dx: 1, dy: 0},
            {dx: 0, dy: -1}, {dx: 0, dy: 1}
        ];

        for (let dir of directions) {
            const x = playerPos.x + dir.dx;
            const y = playerPos.y + dir.dy;
            if (this.isValidCell(x, y) && this.grid[y][x] instanceof Character && !(this.grid[y][x] instanceof ZhaoYun)) {
                const damage = Math.floor(this.player.attack * this.sweepAttackMultiplier);
                this.grid[y][x].takeDamage(damage);
                enemiesHit++;
                if (this.grid[y][x].health <= 0) {
                    this.grid[y][x] = this.generateEnemy(); // 替换为新敌人而不是null
                }
            }
        }

        return `赵云使用了天翔之龙，对周围的${enemiesHit}个敌人造成了${this.sweepAttackMultiplier.toFixed(1)}倍伤害！`;
    }

    poYunLong() {
        const healAmount = this.player.maxHealth * 0.3;
        this.player.heal(healAmount);
        return `赵云使用了破云之龙，恢复了${Math.floor(healAmount)}点生命值！`;
    }

    jingLeiLong() {
        const boostAmount = 5;
        this.player.attack += boostAmount;
        this.player.defense += boostAmount;
        setTimeout(() => {
            this.player.attack -= boostAmount;
            if (this.player.defense >= boostAmount) {
                this.player.defense -= boostAmount;
            } else {
                this.player.defense = 0;
            }
            alert('惊雷之龙效果已经消失！');
            this.updateInfoPanel();
        }, 30000); // 30秒后效果消失
        return `赵云使用了惊雷之龙，攻击力和防御力暂时提升了${boostAmount}点！`;
    }

    updateSkillButtons() {
        const attackBtn = document.getElementById('attack-btn');
        const healBtn = document.getElementById('heal-btn');
        const boostBtn = document.getElementById('boost-btn');

        attackBtn.innerHTML = '天翔<br>之龙';
        healBtn.innerHTML = '破云<br>之龙';
        boostBtn.innerHTML = '惊雷<br>之龙';

        attackBtn.disabled = this.skillsUsed.attack;
        healBtn.disabled = this.skillsUsed.heal;
        boostBtn.disabled = this.skillsUsed.boost;
    }
}

window.onload = () => {
    new Game();
};