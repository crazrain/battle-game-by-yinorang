import { renderScreen } from '../screenUtils.js';
import { playClickSound } from '../../utils/audioUtils.js';

let onStartClickCallback;
let startButton;

const handleStartButtonClick = () => {
    playClickSound();
    if (onStartClickCallback) {
        onStartClickCallback();
    }
};

// 시작 화면을 렌더링하는 함수
export const showStartScreen = (onStartClick) => {
    onStartClickCallback = onStartClick; // 콜백 저장
    const html = `
        <h1>몬스터 격투 게임</h1>
        <button id="start-button">시작하기</button>
    `;
    renderScreen(html);

    startButton = document.getElementById('start-button');
    if (startButton) {
        startButton.addEventListener('click', handleStartButtonClick);
    }
};

export const removeStartScreenListener = () => {
    if (startButton) {
        startButton.removeEventListener('click', handleStartButtonClick);
        startButton = null; // 참조 해제
    }
    onStartClickCallback = null; // 콜백 참조 해제
};
