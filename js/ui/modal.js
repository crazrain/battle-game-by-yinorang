import { playClickSound } from '../utils/audioUtils.js';

// 확인 모달을 표시하는 함수
export const showConfirmationModal = (message, onConfirm) => {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const messageEl = document.createElement('p');
    messageEl.textContent = message;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = '확인';
    confirmButton.className = 'modal-confirm-button';

    const cancelButton = document.createElement('button');
    cancelButton.textContent = '취소';
    cancelButton.className = 'modal-cancel-button';

    modalContent.appendChild(messageEl);
    modalContent.appendChild(confirmButton);
    modalContent.appendChild(cancelButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    const closeModal = () => {
        document.body.removeChild(modalOverlay);
    };

    confirmButton.addEventListener('click', () => {
        playClickSound(); // 클릭 사운드 재생
        onConfirm();
        closeModal();
    });

    cancelButton.addEventListener('click', () => {
        playClickSound(); // 클릭 사운드 재생
        closeModal();
    });
};

// 알림 모달을 표시하는 함수
export const showAlertModal = (message) => {
    const modalOverlay = document.createElement('div');
    modalOverlay.className = 'modal-overlay';

    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';

    const messageEl = document.createElement('p');
    messageEl.textContent = message;

    const confirmButton = document.createElement('button');
    confirmButton.textContent = '확인';
    confirmButton.className = 'modal-confirm-button';

    modalContent.appendChild(messageEl);
    modalContent.appendChild(confirmButton);
    modalOverlay.appendChild(modalContent);
    document.body.appendChild(modalOverlay);

    const closeModal = () => {
        document.body.removeChild(modalOverlay);
    };

    confirmButton.addEventListener('click', () => {
        playClickSound(); // 클릭 사운드 재생
        closeModal();
    });
};
