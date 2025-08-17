export class Skill {
    constructor(name, minAttack, maxAttack) {
        this.name = name;
        this.minAttack = minAttack;
        this.maxAttack = maxAttack;
        this.level = 1;
    }

    // 다음 레벨업에 필요한 경험치
    get requiredExp() {
        return this.level * 10;
    }

    // 스킬 레벨업 로직
    levelUp() {
        this.level++;
        this.minAttack += 2; // 레벨당 최소/최대 공격력 2씩 증가
        this.maxAttack += 2;
    }
}
