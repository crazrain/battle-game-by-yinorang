import { renderScreen } from '../screenUtils.js';
import { showAlertModal } from '../modal.js';

// 몬스터 생성 화면
export const showMonsterScreen = (playerNumber, currentMonsterImageBase64, onSave, onCancel) => {
    const currentMonsterImage = currentMonsterImageBase64 ? `<img src="${currentMonsterImageBase64}" width="150" style="margin-bottom: 10px;">` : '';

    const html = `
        <h2>플레이어 ${playerNumber} 몬스터 설정</h2>
        ${currentMonsterImage}
        <p>몬스터 이미지를 업로드하세요.</p>
        <input type="file" id="monster-image-input" accept="image/*">
        <button id="save-monster-button">저장</button>
        <button id="cancel-monster-button">취소</button>
    `;
    renderScreen(html);

    document.getElementById('cancel-monster-button').addEventListener('click', onCancel);

    document.getElementById('save-monster-button').addEventListener('click', () => {
        const input = document.getElementById('monster-image-input');
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                onSave(e.target.result); // Pass the imageBase64 data to the callback
            };
            reader.readAsDataURL(input.files[0]);
        } else {
            showAlertModal('이미지를 업로드해주세요.');
        }
    });
};
