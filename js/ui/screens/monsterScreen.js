import { renderScreen } from '../screenUtils.js';
import { showAlertModal } from '../modal.js';

// 몬스터 생성 화면
export const showMonsterScreen = (playerNumber, currentMonsterImageBase64, onSave, onCancel) => {
    const html = `
        <h2>플레이어 ${playerNumber} 몬스터 설정</h2>
        <div id="monster-preview-area">
            <img id="current-monster-image" src="${currentMonsterImageBase64 || ''}" width="150" style="margin-bottom: 10px; ${currentMonsterImageBase64 ? '' : 'display: none;'}">
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

    const monsterImageInput = document.getElementById('monster-image-input');
    const currentMonsterImageEl = document.getElementById('current-monster-image');
    const monsterComparisonPreview = document.getElementById('monster-comparison-preview');
    const newMonsterImageEl = document.getElementById('new-monster-image');

    monsterImageInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                newMonsterImageEl.src = e.target.result;
                if (currentMonsterImageBase64) {
                    currentMonsterImageEl.style.display = 'none';
                    monsterComparisonPreview.style.display = 'flex';
                } else {
                    currentMonsterImageEl.style.display = 'none'; // 기존 이미지가 없으므로 단일 이미지 모드
                    monsterComparisonPreview.style.display = 'none'; // 비교 모드 숨김
                    newMonsterImageEl.style.display = 'block'; // 새 이미지만 표시
                    newMonsterImageEl.src = e.target.result; // 새 이미지 src 업데이트
                    // newMonsterImageEl의 부모를 monster-preview-area로 직접 설정
                    document.getElementById('monster-preview-area').innerHTML = '';
                    document.getElementById('monster-preview-area').appendChild(newMonsterImageEl);
                }
            };
            reader.readAsDataURL(file);
        } else {
            // 파일 선택 취소 시 기존 이미지 또는 초기 상태 복원
            if (currentMonsterImageBase64) {
                currentMonsterImageEl.style.display = 'block';
                monsterComparisonPreview.style.display = 'none';
            } else {
                document.getElementById('monster-preview-area').innerHTML = '';
            }
            newMonsterImageEl.src = ''; // 새 이미지 미리보기 초기화
            newMonsterImageEl.style.display = 'none'; // 새 이미지 숨김
        }
    });

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
