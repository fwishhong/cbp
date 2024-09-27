class Item {
    constructor(type, icon, value) {
        this.type = type;
        this.icon = icon;
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
        super('health', '❤️', 30);
    }
}

class AttackBoost extends Item {
    constructor() {
        super('attack', '🔪', 5);
    }
}

class DefenseBoost extends Item {
    constructor() {
        super('defense', '🛡️', 5);
    }
}

class Exit extends Item {
    constructor() {
        super('exit', '🚪', 0);
    }
}