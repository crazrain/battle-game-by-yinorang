import { renderScreen } from '../screenUtils.js';
import { showAlertModal } from '../modal.js';
import { playClickSound } from '../../utils/audioUtils.js';

let onSaveMonsterCallback;
let onCancelMonsterCallback;
let monsterImageInput;
let saveMonsterButton;
let cancelMonsterButton;
let currentMonsterImageEl;
let monsterComparisonPreview;
let newMonsterImageEl;
let monsterPreviewArea;

const handleMonsterImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            newMonsterImageEl.src = e.target.result;
            if (currentMonsterImageEl.dataset.currentImage === 'true') { // currentMonsterImageBase64 대신 dataset 사용
                currentMonsterImageEl.style.display = 'none';
                monsterComparisonPreview.style.display = 'flex';
            } else {
                currentMonsterImageEl.style.display = 'none';
                monsterComparisonPreview.style.display = 'none';
                newMonsterImageEl.style.display = 'block';
                newMonsterImageEl.src = e.target.result;
                monsterPreviewArea.innerHTML = '';
                monsterPreviewArea.appendChild(newMonsterImageEl);
            }
        };
        reader.readAsDataURL(file);
    } else {
        if (currentMonsterImageEl.dataset.currentImage) {
            currentMonsterImageEl.style.display = 'block';
            monsterComparisonPreview.style.display = 'none';
        } else {
            monsterPreviewArea.innerHTML = '';
        }
        newMonsterImageEl.src = '';
        newMonsterImageEl.style.display = 'none';
    }
};

const handleCancelMonsterClick = () => {
    playClickSound();
    if (onCancelMonsterCallback) {
        onCancelMonsterCallback();
    }
};

const handleSaveMonsterClick = () => {
    playClickSound();
    if (monsterImageInput.files && monsterImageInput.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            if (onSaveMonsterCallback) {
                onSaveMonsterCallback(e.target.result);
            }
        };
        reader.readAsDataURL(monsterImageInput.files[0]);
    } else {
        showAlertModal('이미지를 업로드해주세요.');
    }
};

// 몬스터 생성 화면
export const showMonsterScreen = (playerNumber, currentMonsterImageBase64, onSave, onCancel) => {
    onSaveMonsterCallback = onSave;
    onCancelMonsterCallback = onCancel;

    const html = `
        <h2>플레이어 ${playerNumber} 몬스터 설정</h2>
        <div id="monster-preview-area">
            <img id="current-monster-image" src="${currentMonsterImageBase64 || ''}" width="150" style="margin-bottom: 10px; ${currentMonsterImageBase64 ? '' : 'display: none;'}" data-current-image="${currentMonsterImageBase64 ? 'true' : 'false'}">
            <div id="monster-comparison-preview" class="monster-image-comparison" style="display: none;">
                <img id="old-monster-image" src="${currentMonsterImageBase64 || ''}" width="150">
                <span class="comparison-arrow">-></span>
                <img id="new-monster-image" src="" width="150">
            </div>
        </div>
        <p>몬스터 이미지를 업로드하세요.</p>
        <input type="file" id="monster-image-input" accept="image/*">
        <button id="save-monster-button">저장</button>
        <button id="cancel-monster-button">취소</button>
    `;
    renderScreen(html);

    monsterImageInput = document.getElementById('monster-image-input');
    saveMonsterButton = document.getElementById('save-monster-button');
    cancelMonsterButton = document.getElementById('cancel-monster-button');
    currentMonsterImageEl = document.getElementById('current-monster-image');
    monsterComparisonPreview = document.getElementById('monster-comparison-preview');
    newMonsterImageEl = document.getElementById('new-monster-image');
    monsterPreviewArea = document.getElementById('monster-preview-area');

    if (monsterImageInput) {
        monsterImageInput.addEventListener('change', handleMonsterImageChange);
    }
    if (cancelMonsterButton) {
        cancelMonsterButton.addEventListener('click', handleCancelMonsterClick);
    }
    if (saveMonsterButton) {
        saveMonsterButton.addEventListener('click', handleSaveMonsterClick);
    }
};

export const removeMonsterScreenListener = () => {
    if (monsterImageInput) {
        monsterImageInput.removeEventListener('change', handleMonsterImageChange);
        monsterImageInput = null;
    }
    if (cancelMonsterButton) {
        cancelMonsterButton.removeEventListener('click', handleCancelMonsterClick);
        cancelMonsterButton = null;
    }
    if (saveMonsterButton) {
        saveMonsterButton.removeEventListener('click', handleSaveMonsterClick);
        saveMonsterButton = null;
    }
    onSaveMonsterCallback = null;
    onCancelMonsterCallback = null;
    currentMonsterImageEl = null;
    monsterComparisonPreview = null;
    newMonsterImageEl = null;
    monsterPreviewArea = null;
};
