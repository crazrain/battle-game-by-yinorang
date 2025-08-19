import { renderScreen } from '../screenUtils.js';
import { playClickSound } from '../../utils/audioUtils.js';

// 시작 화면을 렌더링하는 함수
export const showStartScreen = (onStartClick) => {
    const html = `
        <h1>몬스터 격투 게임</h1>
        <button id="start-button">시작하기</button>
    `;
    renderScreen(html);

    document.getElementById('start-button').addEventListener('click', () => {
        playClickSound();
        onStartClick();
    });
};
