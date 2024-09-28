class Item {
    constructor(type, iconPath, value) {
        this.type = type;
        this.iconPath = iconPath;
        this.value = value;
    }

    apply(character) {
        switch(this.type) {
            case 'health':
                character.heal(this.value);
                break;
            case 'attack':
                character.attack += this.value;
                break;
            case 'defense':
                character.defense += this.value;
                character.maxDefense += this.value;
                break;
        }
    }
}

class HealthPotion extends Item {
    constructor() {
        super('health', 'images/health_potion.png', 30);
    }
}

class AttackBoost extends Item {
    constructor() {
        super('attack', 'images/attack_boost.png', 5);
    }
}

class DefenseBoost extends Item {
    constructor() {
        super('defense', 'images/defense_boost.png', 5);
    }
}

class Exit extends Item {
    constructor() {
        super('exit', 'images/exit.png', 0);
    }
}