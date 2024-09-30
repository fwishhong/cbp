class Character {
    constructor(type, health, attack, defense, iconPath) {
        this.type = type;
        this.health = health;
        this.maxHealth = health;
        this.attack = attack;
        this.defense = defense;
        this.maxDefense = defense;
        this.iconPath = iconPath;
        this.exp = 0;
        this.level = 1;
        this.critRate = 0.1; // 10% 暴击率
        this.dodgeRate = 0.1; // 10% 闪避率
    }

    takeDamage(damage) {
        if (Math.random() < this.dodgeRate) {
            return 0; // 闪避成功，不受伤害
        }

        // 计算防御力带来的减伤百分比
        const damageReduction = this.defense / (this.defense + 100); // 这个公式可以根据需要调整
        const reducedDamage = Math.floor(damage * (1 - damageReduction));

        this.health = Math.max(0, this.health - reducedDamage);
        return reducedDamage;
    }

    attack(target) {
        let damage = this.attack;
        if (Math.random() < this.critRate) {
            damage *= 2; // 暴击造成双伤害
        }
        return target.takeDamage(damage);
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        // 恢复一些防御力
        this.defense = Math.min(this.maxDefense, this.defense + Math.floor(amount / 2));
    }

    gainExp(amount) {
        this.exp += amount;
        if (this.exp >= this.level * 100) {
            return true; // 返回 true 表示可以升级
        }
        return false;
    }

    levelUpStats() {
        this.level++;
        this.maxHealth += 10;
        this.health = this.maxHealth;
        this.attack += 2;
        this.maxDefense += 3;
        this.defense = this.maxDefense;
        this.critRate += 0.01;
        this.dodgeRate += 0.01;
        this.exp = 0;
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static calculateEnemyAdjustment(playerAttack) {
        if (playerAttack <= 60) return 1;
        const excessAttack = playerAttack - 60;
        const adjustmentTimes = Math.floor(excessAttack / 5);
        let totalAdjustment = 1;
        for (let i = 0; i < adjustmentTimes; i++) {
            // 每5点额外攻击力，增加1%到2%之间的随机比例
            totalAdjustment += Math.random() * 0.01 + 0.01;
        }
        return totalAdjustment;
    }
}

class ZhaoYun extends Character {
    constructor() {
        super('赵云', 100, 20, 50, 'images/zhaoyun.png');
    }
}

class Infantry extends Character {
    constructor(level, levelBonus = 0, playerAttack = 20) {
        const adjustment = Character.calculateEnemyAdjustment(playerAttack);
        let health = Math.floor((Character.getRandomInt(40, 60) + level * 5 + levelBonus * 2) * adjustment);
        let attack = Math.floor((Character.getRandomInt(10, 15) + level + levelBonus) * adjustment);
        let defense = Math.floor((30 + Character.getRandomInt(5, 8) + Math.floor(level / 2) + Math.floor(levelBonus / 2)) * adjustment);
        
        // 前三关特殊处理
        if (level <= 3) {
            health = Math.floor(health * 0.7);
            attack = Math.floor(attack * 0.7);
            defense = Math.floor(defense * 0.7);
            defense = Math.min(defense, 10);
        }
        
        super('步兵', health, attack, defense, 'images/infantry.png');
    }
}

class Archer extends Character {
    constructor(level, levelBonus = 0, playerAttack = 20) {
        const adjustment = Character.calculateEnemyAdjustment(playerAttack);
        let health = Math.floor((Character.getRandomInt(30, 50) + level * 4 + levelBonus * 2) * adjustment);
        let attack = Math.floor((Character.getRandomInt(12, 18) + level + levelBonus) * adjustment);
        let defense = Math.floor((25 + Character.getRandomInt(3, 6) + Math.floor(level / 2) + Math.floor(levelBonus / 2)) * adjustment);
        
        // 前三关特殊处理
        if (level <= 3) {
            health = Math.floor(health * 0.7);
            attack = Math.floor(attack * 0.7);
            defense = Math.floor(defense * 0.7);
            defense = Math.min(defense, 10);
        }
        
        super('弓箭手', health, attack, defense, 'images/archer.png');
    }
}

class Boss extends Character {
    constructor(level, levelBonus = 0, playerAttack = 20) {
        const adjustment = Character.calculateEnemyAdjustment(playerAttack);
        let health = Math.floor((Character.getRandomInt(80, 100) + level * 10 + levelBonus * 5) * adjustment);
        let attack = Math.floor((Character.getRandomInt(18, 25) + level * 2 + levelBonus * 2) * adjustment);
        let defense = Math.floor((40 + Character.getRandomInt(10, 15) + level + levelBonus) * adjustment);
        
        // 前三关特殊处理（虽然前三关不会出现Boss，但为了保持一致性）
        if (level <= 3) {
            health = Math.floor(health * 0.7);
            attack = Math.floor(attack * 0.7);
            defense = Math.floor(defense * 0.7);
            defense = Math.min(defense, 15); // Boss的防御力上限稍高一些
        }
        
        super('武将', health, attack, defense, 'images/boss.png');
    }
}