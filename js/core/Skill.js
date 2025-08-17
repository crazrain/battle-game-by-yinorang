export const DEFAULT_MIN_ATTACK = 0;
export const DEFAULT_MAX_ATTACK = 20;
export const ATTACK_INCREASE_PER_LEVEL = 10;

export class Skill {
    constructor(name, minAttack = DEFAULT_MIN_ATTACK, maxAttack = DEFAULT_MAX_ATTACK, soundPath = null) {
        this.name = name;
        this.minAttack = minAttack;
        this.maxAttack = maxAttack;
        this.level = 1;
        this.soundPath = soundPath; // Add soundPath property
    }

    // 다음 레벨업에 필요한 경험치
    get requiredExp() {
        return this.level * 5;
    }

    // 스킬 레벨업 로직
    levelUp() {
        this.level++;
        this.minAttack += ATTACK_INCREASE_PER_LEVEL; // 레벨당 최소/최대 공격력 2씩 증가
        this.maxAttack += ATTACK_INCREASE_PER_LEVEL;
    }
}
