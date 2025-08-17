import { Skill, EXPERIENCE_PER_DAMAGE_FACTOR } from './Skill.js';

export class BattleSystem {
    constructor(player1, player2, onAttack, onTurnChange, onGameOver) {
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = null;
        this.onAttack = onAttack;         // 공격 시 호출될 콜백
        this.onTurnChange = onTurnChange; // 턴 변경 시 호출될 콜백
        this.onGameOver = onGameOver;     // 게임 종료 시 호출될 콜백
    }

    // 전투 시작
    startBattle() {
        this.player1.monster.hp = 100; // 전투 시작 시 HP 초기화
        this.player2.monster.hp = 100;
        this.currentPlayer = Math.random() < 0.5 ? this.player1 : this.player2;
    }

    // 턴 전환
    switchTurn() {
        this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        this.onTurnChange(); // 턴 변경 콜백 호출
    }

    // 공격 실행
    attack(skill) {
        const damage = Math.floor(Math.random() * (skill.maxAttack - skill.minAttack + 1)) + skill.minAttack;
        const opponent = this.currentPlayer === this.player1 ? this.player2 : this.player1;
        
        opponent.monster.hp -= damage;
        if (opponent.monster.hp < 0) {
            opponent.monster.hp = 0;
        }

        // 입힌 데미지 만큼 경험치 획득
        this.currentPlayer.experience += Math.floor(damage / EXPERIENCE_PER_DAMAGE_FACTOR);

        const logMessage = `${this.currentPlayer.nickname}이(가) ${skill.name}(으)로 ${damage}의 데미지를 입혔다!`;
        this.onAttack(logMessage); // 공격 로그 콜백 호출
        
        // 전투 종료 확인은 UI 애니메이션 후 main.js에서 호출하도록 변경

        this.switchTurn();
    }

    // 게임 종료 여부 확인
    checkGameOver() {
        if (this.player1.monster.hp <= 0) {
            this.onGameOver(this.player2); // Player 1이 졌으므로 Player 2가 승자
            return true;
        }
        if (this.player2.monster.hp <= 0) {
            this.onGameOver(this.player1); // Player 2가 졌으므로 Player 1이 승자
            return true;
        }
        return false;
    }
}
