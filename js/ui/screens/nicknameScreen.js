import { renderScreen } from '../screenUtils.js';
import { showAlertModal } from '../modal.js';
import { playClickSound } from '../../utils/audioUtils.js';

let onSaveNicknameCallback;
let onCancelCallback;
let saveNicknameButton;
let cancelNicknameButton;
let nicknameInput;

const handleSaveNicknameClick = () => {
    playClickSound();
    const nickname = nicknameInput.value;
    if (nickname && nickname.trim() !== '') {
        if (onSaveNicknameCallback) {
            onSaveNicknameCallback(nickname.trim());
        }
    } else {
        showAlertModal('닉네임을 입력해주세요.');
    }
};

const handleCancelNicknameClick = () => {
    playClickSound();
    if (onCancelCallback) {
        onCancelCallback();
    }
};

// 닉네임 생성 화면
export const showNicknameScreen = (playerNumber, onSaveNickname, onCancel) => {
    onSaveNicknameCallback = onSaveNickname;
    onCancelCallback = onCancel;

    const html = `
        <h2>플레이어 ${playerNumber} 닉네임 설정</h2>
        <input type="text" id="nickname-input" placeholder="닉네임을 입력하세요">
        <button id="save-nickname-button">저장</button>
        <button id="cancel-nickname-button">취소</button>
    `;
    renderScreen(html);

    nicknameInput = document.getElementById('nickname-input');
    saveNicknameButton = document.getElementById('save-nickname-button');
    cancelNicknameButton = document.getElementById('cancel-nickname-button');

    if (saveNicknameButton) {
        saveNicknameButton.addEventListener('click', handleSaveNicknameClick);
    }
    if (cancelNicknameButton) {
        cancelNicknameButton.addEventListener('click', handleCancelNicknameClick);
    }
};

export const removeNicknameScreenListener = () => {
    if (saveNicknameButton) {
        saveNicknameButton.removeEventListener('click', handleSaveNicknameClick);
        saveNicknameButton = null;
    }
    if (cancelNicknameButton) {
        cancelNicknameButton.removeEventListener('click', handleCancelNicknameClick);
        cancelNicknameButton = null;
    }
    nicknameInput = null;
    onSaveNicknameCallback = null;
    onCancelCallback = null;
};
