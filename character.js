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

        if (this.defense > 0) {
            if (damage > this.defense) {
                const remainingDamage = damage - this.defense;
                this.defense = 0;
                this.health = Math.max(0, this.health - remainingDamage);
            } else {
                this.defense -= damage;
            }
        } else {
            this.health = Math.max(0, this.health - damage);
        }
        return damage;
    }

    attack(target) {
        let damage = this.attack;
        if (Math.random() < this.critRate) {
            damage *= 2; // 暴击造成双��伤害
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
        const health = Math.floor((Character.getRandomInt(40, 60) + level * 5 + levelBonus * 2) * adjustment);
        const attack = Math.floor((Character.getRandomInt(10, 15) + level + levelBonus) * adjustment);
        const defense = Math.floor((30 + Character.getRandomInt(5, 8) + Math.floor(level / 2) + Math.floor(levelBonus / 2)) * adjustment);
        super('步兵', health, attack, defense, 'images/infantry.png');
    }
}

class Archer extends Character {
    constructor(level, levelBonus = 0, playerAttack = 20) {
        const adjustment = Character.calculateEnemyAdjustment(playerAttack);
        const health = Math.floor((Character.getRandomInt(30, 50) + level * 4 + levelBonus * 2) * adjustment);
        const attack = Math.floor((Character.getRandomInt(12, 18) + level + levelBonus) * adjustment);
        const defense = Math.floor((25 + Character.getRandomInt(3, 6) + Math.floor(level / 2) + Math.floor(levelBonus / 2)) * adjustment);
        super('弓箭手', health, attack, defense, 'images/archer.png');
    }
}

class Boss extends Character {
    constructor(level, levelBonus = 0, playerAttack = 20) {
        const adjustment = Character.calculateEnemyAdjustment(playerAttack);
        const health = Math.floor((Character.getRandomInt(80, 100) + level * 10 + levelBonus * 5) * adjustment);
        const attack = Math.floor((Character.getRandomInt(18, 25) + level * 2 + levelBonus * 2) * adjustment);
        const defense = Math.floor((40 + Character.getRandomInt(10, 15) + level + levelBonus) * adjustment);
        super('武将', health, attack, defense, 'images/boss.png');
    }
}