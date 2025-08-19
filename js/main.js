import { GameState } from './core/GameState.js';
import { Player } from './core/Player.js';
import { Monster } from './core/Monster.js';
import { Skill } from './core/Skill.js';
import { BattleSystem } from './core/BattleSystem.js';
import { showStartScreen } from './ui/screens/startScreen.js';
import { showNicknameScreen } from './ui/screens/nicknameScreen.js';
import { showMonsterScreen } from './ui/screens/monsterScreen.js';
import { showSkillScreen } from './ui/screens/skillScreen.js';
import { showMainMenu, removeMainMenuListener } from './ui/screens/mainMenuScreen.js';
import { showBattleScreen, removeBattleScreenListener } from './ui/screens/battleScreen.js';

let gameState;
let battleSystem;

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
    showMainMenu(gameState, battleSystemCallbacks);
}

// 전투 시작 로직
const startBattleLogic = () => {
    // 전투 시작 시 mainMenu의 이벤트 리스너 제거
    removeMainMenuListener();

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
    if (!gameState.players[0]) {
        showNicknameScreen(1, (nickname) => {
            gameState.players[0] = new Player(nickname);
            checkGameState();
        });
    } else if (!gameState.players[0].monster) {
        showMonsterScreen(1, null, (imageBase64) => {
            gameState.players[0].monster = new Monster(imageBase64, 1); // 초기 hpLevel 1로 설정
            checkGameState();
        }, checkGameState);
    } else if (gameState.players[0].monster.skills.length === 0) {
        showSkillScreen(1, [], skillSoundFiles, (skills) => {
            gameState.players[0].monster.skills = skills;
            gameState.saveState();
            checkGameState();
        }, checkGameState);
    } else if (!gameState.players[1]) {
        showNicknameScreen(2, (nickname) => {
            gameState.players[1] = new Player(nickname);
            checkGameState();
        });
    } else if (!gameState.players[1].monster) {
        showMonsterScreen(2, null, (imageBase64) => {
            gameState.players[1].monster = new Monster(imageBase64, 1); // 초기 hpLevel 1로 설정
            checkGameState();
        }, checkGameState);
    } else if (gameState.players[1].monster.skills.length === 0) {
        showSkillScreen(2, [], skillSoundFiles, (skills) => {
            gameState.players[1].monster.skills = skills;
            gameState.saveState();
            checkGameState();
        }, checkGameState);
    } else {
        showMainMenu(gameState, battleSystemCallbacks);
    }
};

// 게임 초기화 및 시작
const initGame = () => {
    const loadedState = GameState.loadState();
    if (loadedState) {
        gameState = new GameState();
        // 저장된 데이터로부터 Player, Monster, Skill 인스턴스를 복원합니다.
        loadedState.players.forEach((playerData, index) => {
            if (playerData) {
                const player = new Player(playerData.nickname);
                player.experience = playerData.experience || 0;
                player.winCount = playerData.winCount || 0; // 승리 횟수 복원
                player.winningStreak = playerData.winningStreak || 0; // 연승수 복원
                if (playerData.monster) {
                    const monster = new Monster(playerData.monster.imageBase64, playerData.monster.hpLevel);
                    monster.hp = playerData.monster.hp;
                    if (playerData.monster.skills) {
                        monster.skills = playerData.monster.skills.map(skillData =>
                            new Skill(skillData.name, skillData.minAttack, skillData.maxAttack, skillData.level, skillData.soundPath)
                        );
                    }
                    player.monster = monster;
                }
                gameState.players[index] = player;
            }
        });
    } else {
        gameState = new GameState();
    }
    showStartScreen(checkGameState);
};

// 페이지 로드 시 게임 초기화 함수 호출
window.addEventListener('load', initGame);