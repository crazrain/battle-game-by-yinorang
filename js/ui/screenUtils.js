// 화면 렌더링을 관리할 함수
export const renderScreen = (html) => {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = html;
};
