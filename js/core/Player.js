import { Monster } from './Monster.js'; // Monster 클래스 임포트 추가
import { Skill } from './Skill.js'; // Skill 클래스 임포트 추가

export class Player {
    constructor(nickname) {
        this.nickname = nickname;
        this.monster = null; // Monster 객체
        this.experience = 0;
        this.winCount = 0; // 승리 횟수 추가
        this.winningStreak = 0; // 연승수 추가
    }

    // JSON 데이터로부터 Player 인스턴스를 생성하는 정적 팩토리 메서드
    static fromJSON(playerData) {
        const player = new Player(playerData.nickname);
        player.experience = playerData.experience || 0;
        player.winCount = playerData.winCount || 0;
        player.winningStreak = playerData.winningStreak || 0;
        if (playerData.monster) {
            player.monster = Monster.fromJSON(playerData.monster);
        }
        return player;
    }
}
