export class Player {
    constructor(nickname) {
        this.nickname = nickname;
        this.monster = null; // Monster 객체
        this.experience = 0;
        this.winCount = 0; // 승리 횟수 추가
        this.winningStreak = 0; // 연승수 추가
    }
}
