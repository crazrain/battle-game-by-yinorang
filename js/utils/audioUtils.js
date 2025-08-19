export const playClickSound = () => {
    const clickSound = new Audio('assets/audio/mixkit-cool-interface-click-tone-2568.mp3');
    clickSound.volume = 0.5;
    clickSound.play().catch(error => console.error('클릭 사운드 재생 실패:', error));
};

export const playUpgradeSound = () => {
    const upgradeSound = new Audio('assets/audio/mixkit-coins-sound-2003.mp3');
    upgradeSound.volume = 0.5;
    upgradeSound.play().catch(error => console.error('업그레이드 사운드 재생 실패:', error));
};