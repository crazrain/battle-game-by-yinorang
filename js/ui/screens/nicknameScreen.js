import { renderScreen } from '../screenUtils.js';
import { showAlertModal } from '../modal.js';
import { playClickSound } from '../../utils/audioUtils.js';

// 닉네임 생성 화면
export const showNicknameScreen = (playerNumber, onSaveNickname) => {
    const html = `
        <h2>플레이어 ${playerNumber} 닉네임 설정</h2>
        <input type="text" id="nickname-input" placeholder="닉네임을 입력하세요">
        <button id="save-nickname-button">저장</button>
        <button id="cancel-nickname-button">취소</button>
    `;
    renderScreen(html);

    document.getElementById('save-nickname-button').addEventListener('click', () => {
        playClickSound();
        const nickname = document.getElementById('nickname-input').value;
        if (nickname) {
            onSaveNickname(nickname);
        } else {
            showAlertModal('닉네임을 입력해주세요.');
        }
    });

    document.getElementById('cancel-nickname-button').addEventListener('click', () => {
        playClickSound();
        // 취소 로직 (onCancel 콜백이 없으므로 직접 메인 메뉴로 돌아가는 로직이 필요할 수 있음)
        // 현재는 단순히 사운드만 재생하고 아무 동작 안함. 필요시 onCancel 콜백 추가 고려.
    });
};
