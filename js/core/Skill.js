export class Skill {
    constructor(name, minAttack, maxAttack) {
        this.name = name;
        this.minAttack = minAttack;
        this.maxAttack = maxAttack;
        this.level = 1;
    }

    // 스킬 레벨업 로직
    levelUp(exp) {
        // TODO: 경험치를 사용한 레벨업 및 공격력 강화 로직
    }
}
