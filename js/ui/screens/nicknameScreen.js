import { renderScreen } from '../screenUtils.js';
import { showAlertModal } from '../modal.js';

// 닉네임 생성 화면
export const showNicknameScreen = (playerNumber, onSaveNickname) => {
    const html = `
        <h2>플레이어 ${playerNumber} 닉네임 설정</h2>
        <input type="text" id="nickname-input" placeholder="닉네임을 입력하세요">
        <button id="save-nickname-button">저장</button>
    `;
    renderScreen(html);

    document.getElementById('save-nickname-button').addEventListener('click', () => {
        const nickname = document.getElementById('nickname-input').value;
        if (nickname) {
            onSaveNickname(nickname);
        } else {
            showAlertModal('닉네임을 입력해주세요.');
        }
    });
};
