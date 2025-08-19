import { BASE_MONSTER_HP, HP_INCREASE_PER_LEVEL, HP_UPGRADE_REQUIRED_EXP_BASE } from './Skill.js';

export class Monster {
    constructor(imageBase64) {
        this.imageBase64 = imageBase64;
        this.hpLevel = 1; // 체력 레벨
        this.hp = this.maxHp; // 현재 HP는 최대 HP로 초기화
        this.skills = []; // Skill 객체 3개를 담을 배열
    }

    // 최대 HP 계산 (getter)
    get maxHp() {
        return BASE_MONSTER_HP + (this.hpLevel * HP_INCREASE_PER_LEVEL);
    }

    // 체력 레벨업에 필요한 경험치
    get requiredHpExp() {
        return this.hpLevel * HP_UPGRADE_REQUIRED_EXP_BASE;
    }

    // 체력 레벨업 로직
    levelUpHp() {
        this.hpLevel++;
        // 레벨업 시 현재 HP를 최대 HP로 채워주거나, 일정 비율로 채워주는 로직 추가 가능
        // 여기서는 간단히 최대 HP로 설정
        this.hp = this.maxHp;
    }

    // JSON 데이터로부터 Monster 인스턴스를 생성하는 정적 팩토리 메서드
    static fromJSON(monsterData) {
        const monster = new Monster(monsterData.imageBase64);
        monster.hpLevel = monsterData.hpLevel || 1;
        monster.hp = monsterData.hp; // 저장된 현재 HP 복원
        // skills는 Player.fromJSON에서 처리하므로 여기서는 복원하지 않습니다.
        return monster;
    }
}
