import { GameState } from './core/GameState.js';
import { Player } from './core/Player.js';
import { Monster } from './core/Monster.js';
import { Skill } from './core/Skill.js';
import { BattleSystem } from './core/BattleSystem.js';
import { showStartScreen, removeStartScreenListener } from './ui/screens/startScreen.js';
import { showNicknameScreen, removeNicknameScreenListener } from './ui/screens/nicknameScreen.js';
import { showMonsterScreen, removeMonsterScreenListener } from './ui/screens/monsterScreen.js';
import { showSkillScreen, removeSkillScreenListener } from './ui/screens/skillScreen.js';
import { showMainMenu, removeMainMenuListener } from './ui/screens/mainMenuScreen.js';
import { showBattleScreen, removeBattleScreenListener } from './ui/screens/battleScreen.js';
import { preloadAudio } from './utils/audioUtils.js'; // preloadAudio 임포트

let gameState;
let battleSystem;
let currentScreenRemover = null; // 현재 화면의 리스너 제거 함수를 저장할 변수

// 하드코딩된 스킬 사운드 파일 목록 (assets/audio/skill 폴더 기준)
const skillSoundFiles = [
    "skill/s0001.mp3",
    "skill/s0002.mp3",
    "skill/s0003.mp3",
    "skill/s0004.mp3",
    "skill/s0005.mp3",
    "skill/s0006.mp3",
    "skill/s0007.mp3",
    "skill/s0008.mp3",
    "skill/s0009.mp3",
    "skill/s0010.mp3"
];

const backToMenu = () => {
    removeBattleScreenListener();
    currentScreenRemover = removeMainMenuListener; // mainMenu로 돌아가므로 mainMenu 리스너 제거 함수를 저장
    showMainMenu(gameState, battleSystemCallbacks);
}

// 전투 시작 로직
const startBattleLogic = () => {
    // 전투 시작 시 mainMenu의 이벤트 리스너 제거
    if (currentScreenRemover) {
        currentScreenRemover();
    }
    currentScreenRemover = removeBattleScreenListener; // battleScreen으로 전환되므로 battleScreen 리스너 제거 함수를 저장

    battleSystem = new BattleSystem(gameState.players[0], gameState.players[1]);
    battleSystem.startBattle();
    showBattleScreen(battleSystem, skillSoundFiles, backToMenu, gameState);
};

// mainMenuScreen으로 전달할 콜백 객체
const battleSystemCallbacks = {
    startBattleLogic,
    skillSoundFiles,
    gameState // gameState 추가
};

// 게임 상태를 확인하고 다음 단계로 진행
const checkGameState = () => {
    // 이전 화면의 리스너 제거
    if (currentScreenRemover) {
        currentScreenRemover();
    }

    if (!gameState.players[0]) {
        currentScreenRemover = removeNicknameScreenListener;
        showNicknameScreen(1, (nickname) => {
            gameState.players[0] = new Player(nickname);
            checkGameState();
        }, checkGameState); // onCancel 콜백 추가
    } else if (!gameState.players[0].monster) {
        currentScreenRemover = removeMonsterScreenListener;
        showMonsterScreen(1, null, (imageBase64) => {
            gameState.players[0].monster = new Monster(imageBase64, 1); // 초기 hpLevel 1로 설정
            checkGameState();
        }, checkGameState);
    } else if (gameState.players[0].monster.skills.length === 0) {
        currentScreenRemover = removeSkillScreenListener;
        showSkillScreen(1, [], skillSoundFiles, (skills) => {
            gameState.players[0].monster.skills = skills;
            gameState.saveState();
            checkGameState();
        }, checkGameState);
    } else if (!gameState.players[1]) {
        currentScreenRemover = removeNicknameScreenListener;
        showNicknameScreen(2, (nickname) => {
            gameState.players[1] = new Player(nickname);
            checkGameState();
        }, checkGameState); // onCancel 콜백 추가
    } else if (!gameState.players[1].monster) {
        currentScreenRemover = removeMonsterScreenListener;
        showMonsterScreen(2, null, (imageBase64) => {
            gameState.players[1].monster = new Monster(imageBase64, 1); // 초기 hpLevel 1로 설정
            checkGameState();
        }, checkGameState);
    } else if (gameState.players[1].monster.skills.length === 0) {
        currentScreenRemover = removeSkillScreenListener;
        showSkillScreen(2, [], skillSoundFiles, (skills) => {
            gameState.players[1].monster.skills = skills;
            gameState.saveState();
            checkGameState();
        }, checkGameState);
    } else {
        currentScreenRemover = removeMainMenuListener;
        showMainMenu(gameState, battleSystemCallbacks);
    }
};

// 게임 초기화 및 시작
const initGame = () => {
    // 사운드 파일 미리 로드
    preloadAudio('assets/audio/mixkit-cool-interface-click-tone-2568.mp3');
    preloadAudio('assets/audio/mixkit-coins-sound-2003.mp3');
    skillSoundFiles.forEach(file => preloadAudio(`assets/audio/${file}`));

    const loadedState = GameState.loadState();
    if (loadedState) {
        gameState = new GameState();
        // 저장된 데이터로부터 Player, Monster, Skill 인스턴스를 복원합니다.
        loadedState.players.forEach((playerData, index) => {
            if (playerData) {
                gameState.players[index] = Player.fromJSON(playerData);
            }
        });
    } else {
        gameState = new GameState();
    }
    currentScreenRemover = removeStartScreenListener; // 시작 화면 리스너 제거 함수 저장
    showStartScreen(checkGameState);
};

// 페이지 로드 시 게임 초기화 함수 호출
window.addEventListener('load', initGame);