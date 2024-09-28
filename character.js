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
            damage *= 2; // 暴击造成双倍伤害
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
            this.levelUp();
        }
    }

    levelUp() {
        this.level++;
        this.maxHealth += 10;
        this.health = this.maxHealth;
        this.attack += 2;
        this.maxDefense += 1;
        this.defense = this.maxDefense;
        this.critRate += 0.01; // 每级提升1%暴击率
        this.dodgeRate += 0.01; // 每级提升1%闪避率
        this.exp = 0;
        alert(`赵云升级了！现在是${this.level}级。`);
    }

    static getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
}

class ZhaoYun extends Character {
    constructor() {
        super('赵云', 100, 20, 10, 'images/zhaoyun.png');
    }
}

class Infantry extends Character {
    constructor(level) {
        const health = Character.getRandomInt(40, 60) + level * 5;
        const attack = Character.getRandomInt(10, 15) + level;
        const defense = Character.getRandomInt(5, 8) + Math.floor(level / 2);
        super('步兵', health, attack, defense, 'images/infantry.png');
    }
}

class Archer extends Character {
    constructor(level) {
        const health = Character.getRandomInt(30, 50) + level * 4;
        const attack = Character.getRandomInt(12, 18) + level;
        const defense = Character.getRandomInt(3, 6) + Math.floor(level / 2);
        super('弓箭手', health, attack, defense, 'images/archer.png');
    }
}

class Boss extends Character {
    constructor(level) {
        const health = Character.getRandomInt(80, 100) + level * 10;
        const attack = Character.getRandomInt(18, 25) + level * 2;
        const defense = Character.getRandomInt(10, 15) + level;
        super('武将', health, attack, defense, 'images/boss.png');
    }
}