import { Skill, EXPERIENCE_PER_DAMAGE_FACTOR } from './Skill.js';

export class BattleSystem {
    constructor(player1, player2, onAttack, onTurnChange, onGameOver) {
        this.player1 = player1;
        this.player2 = player2;
        this.currentPlayer = null;
        this.onAttack = onAttack;         // 공격 시 호출될 콜백
        this.onTurnChange = onTurnChange; // 턴 변경 시 호출될 콜백
        this.onGameOver = onGameOver;     // 게임 종료 시 호출될 콜백
        this.isGameOver = false; // 게임 종료 여부 플래그 추가
    }

    // 전투 시작
    startBattle() {
        this.player1.monster.hp = 100; // 전투 시작 시 HP 초기화
        this.player2.monster.hp = 100;
        this.currentPlayer = Math.random() < 0.5 ? this.player1 : this.player2;
        this.isGameOver = false; // 게임 시작 시 플래그 초기화
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

        const logMessage = `${this.currentPlayer.nickname}이(가) ${skill.name}(을)를 사용하였다!<span class="damage-number-in-log">-${damage}</span>`;
        this.onAttack(logMessage, damage, opponent); // 공격 로그, 데미지, 피격자 정보를 콜백으로 전달
        
        // 전투 종료 확인은 UI 애니메이션 후 main.js에서 호출하도록 변경

        this.switchTurn();
    }

    // 게임 종료 여부 확인
    checkGameOver() {
        if (this.isGameOver) return true; // 이미 게임이 종료되었으면 중복 처리 방지

        if (this.player1.monster.hp <= 0) {
            // Player 2 승리
            this.player2.winCount++;
            this.player2.winningStreak++;
            this.player1.winningStreak = 0;
            this.onGameOver(this.player2);
            this.isGameOver = true; // 게임 종료 플래그 설정
            return true;
        }
        if (this.player2.monster.hp <= 0) {
            // Player 1 승리
            this.player1.winCount++;
            this.player1.winningStreak++;
            this.player2.winningStreak = 0;
            this.onGameOver(this.player1);
            this.isGameOver = true; // 게임 종료 플래그 설정
            return true;
        }
        return false;
    }
}