export const DEFAULT_MIN_ATTACK = 5;
export const DEFAULT_MAX_ATTACK = 20;
export const ATTACK_INCREASE_PER_LEVEL = 5; // 레벨당 공격력 증가량 조정

export const BASE_MONSTER_HP = 70; // 몬스터 기본 체력 (hpLevel 1일 때 70)
export const HP_INCREASE_PER_LEVEL = 30; // 레벨당 체력 증가량
export const HP_UPGRADE_REQUIRED_EXP_BASE = 10; // 체력 레벨업 필요 경험치 기본값
export const EXPERIENCE_REDUCTION_PER_HP_LEVEL_FACTOR = 0.1; // 상대방 HP 레벨당 경험치 감소 계수

export const EXPERIENCE_PER_DAMAGE_FACTOR = 5; // 데미지당 경험치 획득 비율 (데미지 / 이 값)
export const SKILL_REQUIRED_EXP_BASE = 15; // 스킬 레벨업 필요 경험치 기본값

export class Skill {
    constructor(name, minAttack = DEFAULT_MIN_ATTACK, maxAttack = DEFAULT_MAX_ATTACK, level = 1, soundPath = null) {
        this.name = name;
        this.minAttack = minAttack;
        this.maxAttack = maxAttack;
        this.level = level; // 레벨을 인자로 받아 설정
        this.soundPath = soundPath; // Add soundPath property
    }

    // 다음 레벨업에 필요한 경험치
    get requiredExp() {
        return this.level * SKILL_REQUIRED_EXP_BASE;
    }

    // 스킬 레벨업 로직
    levelUp() {
        this.level++;
        this.minAttack += ATTACK_INCREASE_PER_LEVEL;
        this.maxAttack += ATTACK_INCREASE_PER_LEVEL;
    }
}

