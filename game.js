class Game {
    constructor() {
        this.player = new ZhaoYun();
        this.level = 1;
        this.maxGridSize = 5; // 最大格子数限制
        this.gridSize = 3; // 初始格子数为3x3
        this.grid = [];
        this.gameOver = false;

        this.gameBoard = document.getElementById('game-board');
        this.infoPanel = document.getElementById('info-panel');

        document.getElementById('start-game').addEventListener('click', () => this.startGame());
        document.getElementById('tutorial').addEventListener('click', () => this.showTutorial());
        document.getElementById('close-tutorial').addEventListener('click', () => this.hideTutorial());

        this.playerLevel = 1;

        this.skillsUsed = {
            attack: false,
            heal: false,
            boost: false
        };

        document.getElementById('attack-btn').addEventListener('click', () => this.useSkill('attack'));
        document.getElementById('heal-btn').addEventListener('click', () => this.useSkill('heal'));
        document.getElementById('boost-btn').addEventListener('click', () => this.useSkill('boost'));

        this.sweepAttackMultiplier = 0.6; // 初始天翔龙倍率
        this.jingLeiLongActive = false;

        this.createBattleInfoPanel();
        this.createIntroPanel();

        this.difficultyFactor = 1.0;
        this.consecutiveWins = 0;
        this.consecutiveLosses = 0;
    }

    startGame() {
        console.log('startGame method called');
        this.showIntroPanel();
    }

    showTutorial() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('tutorial-screen').classList.remove('hidden');
    }

    hideTutorial() {
        document.getElementById('tutorial-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
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
        return { x, y };
    }

    getFarthestCell(playerPos) {
        let maxDistance = 0;
        let farthestCell = null;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                let distance = Math.abs(x - playerPos.x) + Math.abs(y - playerPos.y);
                if (distance > maxDistance) {
                    maxDistance = distance;
                    farthestCell = { x, y };
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
                    emptyCells.push({ x, y });
                }
            }
        }
        if (emptyCells.length === 0) return null;
        return emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }

    generateEnemy() {
        const enemyType = Math.random();
        const levelBonus = this.level - 1;
        const playerAttack = this.player.attack;
        const adjustedLevel = Math.floor(this.playerLevel * this.difficultyFactor);

        if (playerAttack <= 40) {
            if (enemyType < 0.6) {
                return new Infantry(this.level, levelBonus, playerAttack);
            } else {
                return new Archer(this.level, levelBonus, playerAttack);
            }
        } else {
            if (enemyType < 0.5) {
                return new Infantry(this.level, levelBonus, playerAttack);
            } else if (enemyType < 0.8) {
                return new Archer(this.level, levelBonus, playerAttack);
            } else {
                return new Boss(this.level, levelBonus, playerAttack);
            }
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

        // 从第五关开始，在出口周围置更多武将
        if (this.level >= 5) {
            const exitPos = this.findExit();
            if (exitPos) {
                this.placeEnemiesAroundExit(exitPos, Math.min(4, this.gridSize - 2));
            }
        }

        for (let i = 0; i < enemiesToPlace; i++) {
            let pos = this.getRandomEmptyCell();
            if (pos) this.grid[pos.y][pos.x] = this.generateEnemy();
        }
    }

    placeEnemiesAroundExit(exitPos, count) {
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: -1 }, { dx: -1, dy: 1 },
            { dx: 1, dy: -1 }, { dx: 1, dy: 1 }
        ];

        for (let i = 0; i < count; i++) {
            if (directions.length === 0) break;
            const randomIndex = Math.floor(Math.random() * directions.length);
            const dir = directions.splice(randomIndex, 1)[0];
            const newX = exitPos.x + dir.dx;
            const newY = exitPos.y + dir.dy;

            if (this.isValidCell(newX, newY) && this.grid[newY][newX] === null) {
                if (this.player.attack <= 40) {
                    // 当赵云攻击力不超过40时，在出口周围生成步兵或弓箭手
                    this.grid[newY][newX] = Math.random() < 0.6 ? new Infantry(this.playerLevel) : new Archer(this.playerLevel);
                } else {
                    this.grid[newY][newX] = new Boss(this.playerLevel);
                }
            }
        }
    }

    findExit() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] instanceof Exit) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    markAdjacentCells(x, y) {
        const directions = [
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 },
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 }
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

        // 计算字体大小
        const baseFontSize = 14; // 调整基础字体大小
        const minFontSize = 6; // 调整最小字体大小
        const fontSizeRatio = cellSize / 100; // 假设100px是标准格子大小
        const fontSize = Math.max(baseFontSize * fontSizeRatio, minFontSize);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.classList.add('cell');
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;
                const content = this.grid[y][x];

                if (content instanceof Character || content instanceof Item) {
                    const img = document.createElement('img');
                    img.src = content.iconPath;
                    img.classList.add('cell-icon');
                    if (content instanceof Item) {
                        img.classList.add('item-icon');
                        if (content instanceof Exit) {
                            img.classList.add('exit-icon');
                        }
                        cell.style.backgroundColor = 'var(--item-bg-color)';
                    } else if (content instanceof ZhaoYun) {
                        cell.classList.add('zhaoyun-cell');
                        cell.style.backgroundColor = 'var(--zhaoyun-bg-color)';
                        cell.style.zIndex = '100'; // 添加一行
                    }
                    cell.appendChild(img);

                    if (content instanceof Character) {
                        const stats = document.createElement('div');
                        stats.classList.add('cell-stats');
                        stats.style.setProperty('--cell-font-size', `${fontSize}px`);

                        if (fontSize < 6) {
                            // 如果字体太小，不显示任何信息
                            stats.style.display = 'none';
                        } else {
                            const iconsRow = document.createElement('div');
                            iconsRow.classList.add('cell-stats-row');
                            iconsRow.innerHTML = `
                                <span class="icon">❤️</span>
                                <span class="icon">⚔️</span>
                                <span class="icon">🛡️</span>
                            `;
                            stats.appendChild(iconsRow);

                            const valuesRow = document.createElement('div');
                            valuesRow.classList.add('cell-stats-row');
                            valuesRow.innerHTML = `
                                <span class="value">${content.health}</span>
                                <span class="value">${content.attack}</span>
                                <span class="value">${content.defense}</span>
                            `;
                            stats.appendChild(valuesRow);
                        }
                        cell.appendChild(stats);
                    }
                } else {
                    cell.style.backgroundColor = 'white';
                }

                cell.addEventListener('click', () => this.handleCellClick(x, y));
                this.gameBoard.appendChild(cell);
            }
        }

        // 更新经验条和底部文字条的宽度
        this.updateInfoPanel();
        this.updateCreditsWidth();
    }

    updateInfoPanel() {
        const expBar = document.getElementById('exp-bar');
        const gameBoard = document.getElementById('game-board');
        const expPercentage = (this.player.exp / (this.player.level * 100)) * 100;

        // 动态设置经验条的宽度
        expBar.style.width = gameBoard.offsetWidth + 'px';

        expBar.innerHTML = `
            <div id="exp-progress" style="width: ${expPercentage}%"></div>
            <div id="exp-text">${this.player.exp} / ${this.player.level * 100}</div>
        `;
    }

    updateCreditsWidth() {
        const gameCredits = document.getElementById('game-credits');
        const gameBoard = document.getElementById('game-board');

        // 动态设置底部文字条的宽度
        gameCredits.style.width = gameBoard.offsetWidth + 'px';
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
                if (clickedContent.health <= 0) {
                    this.grid[y][x] = this.player;
                    this.grid[playerPos.y][playerPos.x] = this.generateEnemy();
                }
            } else if (clickedContent instanceof Item && !(clickedContent instanceof Exit)) {
                clickedContent.apply(this.player);
                this.showBattleInfo(`赵云使用了${clickedContent.type === 'health' ? '生命药水' : clickedContent.type === 'attack' ? '攻击增强' : '防御增强'}！`);
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
        const attackerPos = this.findCharacterPosition(attacker);
        const defenderPos = this.findCharacterPosition(defender);

        console.log('Battle positions:', attackerPos, defenderPos);

        if (attackerPos && defenderPos) {
            // 添加攻击者冲撞动画
            this.addChargeAnimation(attackerPos.x, attackerPos.y, defenderPos.x, defenderPos.y);
        } else {
            console.error('Invalid positions for charge animation');
        }

        const damage = attacker.attack;
        const actualDamage = defender.takeDamage(damage);
        const damageReduction = damage - actualDamage;

        let result = '';
        if (actualDamage === 0) {
            result = `${defender.type}<span style="color: #1E90FF;">闪避</span>了攻击！`;
        } else {
            if (Math.random() < attacker.critRate) {
                result = `${attacker.type}打出了<span style="color: #FF4500;">暴击</span>，对${defender.type}造成了${actualDamage}点伤害！`;
            } else {
                result = `${attacker.type}对${defender.type}造成了${actualDamage}点伤害！`;
            }
            if (damageReduction > 0) {
                result += `<br>${defender.type}的防御力减少了${damageReduction}点伤害！`;
            }
        }

        if (defender.health <= 0) {
            result += `<br>${defender.type}被击败了！`;
            if (defender instanceof ZhaoYun) {
                this.gameOver = true;
                result += "<br>游戏结束！";
            } else {
                let expGained = 10;
                if (defender instanceof Boss) {
                    expGained = 30;
                }
                if (this.player.gainExp(expGained)) {
                    this.handlePlayerLevelUp();
                }
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

        if (defender.health <= 0) {
            if (defender instanceof ZhaoYun) {
                this.consecutiveLosses++;
                this.consecutiveWins = 0;
            } else {
                this.consecutiveWins++;
                this.consecutiveLosses = 0;
            }
            this.adjustDifficulty();
        }

        this.showBattleInfo(result);
        return result;
    }

    findPlayer() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] instanceof ZhaoYun) {
                    return { x, y };
                }
            }
        }
        return null;
    }

    nextLevel() {
        this.level++;
        let introText = "";

        const introTexts = {
            1: "曹操大军南下。刘备军节节败退，转战荆州。赵云奉命断后，保护刘备家眷，一场惊心动魄的追逃大戏即将上演",
            2: "赵云暗自寻思道：'主公将甘、糜两位夫人和小主人阿斗全部托付在我身上，现在都在军中失散，我还有什么面目去见主公？不如去决一死战，好歹要寻到主母和小主人的下落！'",
        };

        introText = introTexts[this.level] || "";

        if (this.level === 2) {
            this.gridSize = 4; // 第二关变为4x4
        } else if (this.level >= 4) {
            this.gridSize = this.maxGridSize; // 第四关及以后保持5x5
        }

        if (introText) {
            this.showIntroPanel(introText);
        }

        this.playerLevel = Math.floor((this.level + 1) / 2);
        this.skillsUsed = {
            attack: false,
            heal: false,
            boost: false
        };

        // 除惊雷之龙效果
        if (this.jingLeiLongActive) {
            this.player.attack = Math.floor(this.player.attack / 1.2); // 移除20%攻击力加成
            this.player.defense = Math.floor(this.player.defense / 1.3); // 移除30%防御力加成
            this.jingLeiLongActive = false;
        }

        this.initLevel();
        this.renderGrid();
        this.updateInfoPanel();
        this.updateSkillButtons();
    }

    checkGameOver() {
        if (this.gameOver) {
            this.showGeneralInfoPanel("赵云力战而亡，长坂坡之战结束。游戏over！", 3000);
            setTimeout(() => {
                location.reload(); // 3秒后重新加载页面以重启游戏
            }, 3000);
        }
    }

    useSkill(skillType) {
        if (this.skillsUsed[skillType]) {
            this.showBattleInfo('这技能在本关卡已经用过了！');
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
        this.showBattleInfo(message);
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

        this.addEffectToCell(playerPos.x, playerPos.y, 'tianxiang-effect');
        this.addAnimationToCell(playerPos.x, playerPos.y, 'shake-animation');

        const damagePercentage = 0.8; // 80% 的攻击力

        for (let dir of directions) {
            const x = playerPos.x + dir.dx;
            const y = playerPos.y + dir.dy;
            if (this.isValidCell(x, y) && this.grid[y][x] instanceof Character && !(this.grid[y][x] instanceof ZhaoYun)) {
                const damage = Math.floor(this.player.attack * damagePercentage);
                this.grid[y][x].takeDamage(damage);
                enemiesHit++;
                this.addAnimationToCell(x, y, 'flash-animation');
                if (this.grid[y][x].health <= 0) {
                    this.grid[y][x] = this.generateEnemy();
                }
            }
        }

        setTimeout(() => this.removeEffectFromCell(playerPos.x, playerPos.y, 'tianxiang-effect'), 500);
        return `赵云使用了天翔之龙，对周围的${enemiesHit}个敌人造成了${Math.floor(damagePercentage * 100)}%攻击力的伤害！`;
    }

    poYunLong() {
        const healPercentage = 0.3; // 恢复30%的最大生命值
        const healAmount = Math.floor(this.player.maxHealth * healPercentage);
        this.player.heal(healAmount);
        const playerPos = this.findPlayer();
        this.addEffectToCell(playerPos.x, playerPos.y, 'poyun-effect');
        this.addAnimationToCell(playerPos.x, playerPos.y, 'flash-animation');
        setTimeout(() => this.removeEffectFromCell(playerPos.x, playerPos.y, 'poyun-effect'), 500);
        return `赵云使用了破云之龙，恢复了${Math.floor(healPercentage * 100)}%的生命值（${healAmount}点）！`;
    }

    jingLeiLong() {
        const attackBoostPercentage = 0.2; // 提升20%攻击力
        const defenseBoostPercentage = 0.3; // 提升30%防御力

        if (this.jingLeiLongActive) {
            this.player.attack = Math.floor(this.player.attack / (1 + attackBoostPercentage));
            this.player.defense = Math.floor(this.player.defense / (1 + defenseBoostPercentage));
        }

        const attackBoost = Math.floor(this.player.attack * attackBoostPercentage);
        const defenseBoost = Math.floor(this.player.defense * defenseBoostPercentage);

        this.player.attack += attackBoost;
        this.player.defense += defenseBoost;
        this.jingLeiLongActive = true;

        const playerPos = this.findPlayer();
        this.addEffectToCell(playerPos.x, playerPos.y, 'jinglei-effect');
        this.addAnimationToCell(playerPos.x, playerPos.y, 'shake-animation');
        setTimeout(() => this.removeEffectFromCell(playerPos.x, playerPos.y, 'jinglei-effect'), 500);

        return `赵云使用了惊雷之龙，攻击力提升了${Math.floor(attackBoostPercentage * 100)}%（${attackBoost}点），防御力提升了${Math.floor(defenseBoostPercentage * 100)}%（${defenseBoost}点）！`;
    }

    updateSkillButtons() {
        const attackBtn = document.getElementById('attack-btn');
        const healBtn = document.getElementById('heal-btn');
        const boostBtn = document.getElementById('boost-btn');

        attackBtn.textContent = '天翔之龙';
        healBtn.textContent = '破云之龙';
        boostBtn.textContent = '惊雷之龙';

        attackBtn.disabled = this.skillsUsed.attack;
        healBtn.disabled = this.skillsUsed.heal;
        boostBtn.disabled = this.skillsUsed.boost;
    }

    // 添加攻击动画
    addAttackAnimation(x, y) {
        const cell = this.getCellElement(x, y);
        cell.classList.add('attack-animation');
        setTimeout(() => cell.classList.remove('attack-animation'), 300);
    }

    // 添加技能释放粒子效果
    addSkillParticles(x, y) {
        const cell = this.getCellElement(x, y);
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.style.setProperty('--x', `${(Math.random() - 0.5) * 100}px`);
            particle.style.setProperty('--y', `${(Math.random() - 0.5) * 100}px`);
            cell.appendChild(particle);
            setTimeout(() => particle.remove(), 1000);
        }
    }

    // 添加受伤闪烁效果
    addHurtAnimation(x, y) {
        const cell = this.getCellElement(x, y);
        cell.classList.add('hurt-animation');
        setTimeout(() => cell.classList.remove('hurt-animation'), 500);
    }

    // 辅助方法：获取指定坐标的单元格元素
    getCellElement(x, y) {
        return this.gameBoard.children[y * this.gridSize + x];
    }

    // 辅助方法：查找角色位置
    findCharacterPosition(character) {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x] === character) {
                    return {x, y};
                }
            }
        }
        return null;
    }

    createBattleInfoPanel() {
        this.battleInfoPanel = document.createElement('div');
        this.battleInfoPanel.id = 'battle-info-panel';
        this.battleInfoPanel.classList.add('hidden');
        document.body.appendChild(this.battleInfoPanel);
    }

    showBattleInfo(message, duration = 1200) {
        this.battleInfoPanel.innerHTML = `
            <div id="battle-info-content">${this.formatBattleInfo(message)}</div>
        `;
        this.battleInfoPanel.classList.remove('hidden');
        this.battleInfoPanel.classList.add('show');
        
        setTimeout(() => {
            this.battleInfoPanel.classList.remove('show');
            this.battleInfoPanel.classList.add('hidden');
        }, duration);
    }

    formatBattleInfo(message) {
        return message
            .replace(/(\d+)点伤害/g, '<span class="damage">$1点伤害</span>')
            .replace(/(\d+)点生命值/g, '<span class="heal">$1点生命值</span>')
            .replace(/暴击/g, '<span class="crit">暴击</span>')
            .replace(/闪避/g, '<span class="dodge">闪避</span>');
    }

    addEffectToCell(x, y, effectClass) {
        const cell = this.getCellElement(x, y);
        cell.classList.add(effectClass);
    }

    removeEffectFromCell(x, y, effectClass) {
        const cell = this.getCellElement(x, y);
        cell.classList.remove(effectClass);
    }

    addAnimationToCell(x, y, animationClass) {
        const cell = this.getCellElement(x, y);
        cell.classList.add(animationClass);
        setTimeout(() => cell.classList.remove(animationClass), 500);
    }

    createIntroPanel() {
        this.introPanel = document.createElement('div');
        this.introPanel.id = 'intro-panel';
        this.introPanel.classList.add('hidden');
        document.body.appendChild(this.introPanel);
    }

    showIntroPanel(text = "") {
        console.log('showIntroPanel method called');
        const introText = text || "公元208年，曹操大军南下。刘备军节节败退，转战荆州。赵云奉命断后，保护刘备家眷，一场惊心动魄的追逃大戏即将上演";
        this.introPanel.innerHTML = `
            <div id="intro-content">
                <img src="images/intro-background.jpg" alt="Intro Background" id="intro-background">
                <p>${introText}</p>
            </div>
        `;
        this.introPanel.classList.remove('hidden');
        this.introPanel.classList.add('show');
        
        setTimeout(() => {
            this.introPanel.classList.remove('show');
            this.introPanel.classList.add('hidden');
            this.startGameActual(); // 确保这个方法被调用
        }, 2500);
    }

    startGameActual() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        this.initLevel();
        this.renderGrid();
        this.updateInfoPanel();
        this.updateSkillButtons();
    }

    showGeneralInfoPanel(text, duration = 2500) {
        this.introPanel.innerHTML = `
            <div id="intro-content">
                <img src="images/intro-background.jpg" alt="Info Background" id="intro-background">
                <p>${text}</p>
            </div>
        `;
        this.introPanel.classList.remove('hidden');
        this.introPanel.classList.add('show');
        
        setTimeout(() => {
            this.introPanel.classList.remove('show');
            this.introPanel.classList.add('hidden');
        }, duration);
    }

    handlePlayerLevelUp() {
        this.player.levelUpStats();
        this.showGeneralInfoPanel(`赵云突破武艺，升级了！现在是${this.player.level}级。`, 2000);
    }

    adjustDifficulty() {
        if (this.consecutiveWins >= 3) {
            this.difficultyFactor += 0.1;
            this.consecutiveWins = 0;
        } else if (this.consecutiveLosses >= 2) {
            this.difficultyFactor = Math.max(0.8, this.difficultyFactor - 0.1);
            this.consecutiveLosses = 0;
        }
        this.difficultyFactor = Math.min(2.0, this.difficultyFactor); // 设置最大难度系数
    }

    // 新增方法：添加冲撞动画
    addChargeAnimation(fromX, fromY, toX, toY) {
        console.log('Charge animation called:', fromX, fromY, toX, toY);
        const cell = this.getCellElement(fromX, fromY);
        if (!cell) {
            console.error('Cell element not found:', fromX, fromY);
            return;
        }
        const dx = toX - fromX;
        const dy = toY - fromY;
        
        const chargeX = dx * 30;
        const chargeY = dy * 30;

        // 保存原始样式
        const originalZIndex = cell.style.zIndex;
        const originalTransition = cell.style.transition;
        const originalTransform = cell.style.transform;

        // 设置新样式
        cell.style.zIndex = '1000';
        cell.style.position = 'relative';
        cell.style.transition = 'transform 0.5s ease-in-out'; // 增加动画时间

        console.log('Applying transform:', `translate(${chargeX}px, ${chargeY}px)`);
        
        // 使用 requestAnimationFrame 来确保样式更改已应用
        requestAnimationFrame(() => {
            cell.style.transform = `translate(${chargeX}px, ${chargeY}px)`;
            console.log('Transform applied:', cell.style.transform);

            // 添加一个类来触发动画
            cell.classList.add('charging');

            setTimeout(() => {
                console.log('Resetting transform');
                cell.style.transition = 'transform 0.5s ease-in-out'; // 增加返回动画时间
                cell.style.transform = 'translate(0, 0)'; // 确保重置为原始位置
                console.log('Transform reset:', cell.style.transform);
                
                // 移除charging类
                cell.classList.remove('charging');

                // 添加震动效果
                setTimeout(() => {
                    console.log('Adding shake animation');
                    cell.classList.add('shake-animation');
                    setTimeout(() => {
                        console.log('Removing shake animation');
                        cell.classList.remove('shake-animation');
                        
                        // 恢复原始样式
                        cell.style.zIndex = originalZIndex;
                        cell.style.transition = originalTransition;
                        cell.style.position = 'static';
                    }, 500);
                }, 200);
            }, 500);
        });
    }
}

window.onload = () => {
    new Game();
};