const audioCache = {}; // 오디오 객체를 저장할 캐시

// 사운드 파일을 미리 로드하는 함수
export const preloadAudio = (path, volume = 0.5) => {
    if (audioCache[path]) {
        return audioCache[path];
    }
    const audio = new Audio(path);
    audio.volume = volume;
    audio.load(); // 사운드 로드 시작
    audioCache[path] = audio;
    return audio;
};

// 캐싱된 오디오를 재생하는 함수
export const playCachedSound = (path) => {
    const audio = audioCache[path];
    if (audio) {
        // 현재 재생 중인 사운드가 있다면 처음부터 다시 재생
        if (!audio.paused) {
            audio.currentTime = 0;
        }
        audio.play().catch(error => console.error(`사운드 재생 실패 (${path}):`, error));
    } else {
        console.warn(`캐싱되지 않은 사운드 재생 시도: ${path}. preloadAudio를 먼저 호출해주세요.`);
        // 캐싱되지 않은 경우, 즉시 로드하여 재생 (폴백)
        const newAudio = new Audio(path);
        newAudio.volume = 0.5; // 기본 볼륨
        newAudio.play().catch(error => console.error(`폴백 사운드 재생 실패 (${path}):`, error));
    }
};

export const playClickSound = () => {
    playCachedSound('assets/audio/mixkit-cool-interface-click-tone-2568.mp3');
};

export const playUpgradeSound = () => {
    playCachedSound('assets/audio/mixkit-coins-sound-2003.mp3');
};