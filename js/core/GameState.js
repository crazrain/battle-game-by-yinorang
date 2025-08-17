export class GameState {
    constructor() {
        this.players = []; // Player 객체 2개를 담을 배열
    }

    // 게임 상태를 localStorage에 저장
    saveState() {
        localStorage.setItem('gameState', JSON.stringify(this));
    }

    // localStorage에서 게임 상태를 불러오기
    static loadState() {
        const savedState = localStorage.getItem('gameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            // 클래스 인스턴스로 복원하는 로직 추가 필요
            return state;
        }
        return null;
    }
}
