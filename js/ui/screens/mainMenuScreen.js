import { renderScreen } from '../screenUtils.js';
import { showAlertModal, showConfirmationModal } from '../modal.js';
import { showMonsterScreen } from './monsterScreen.js';
import { showSkillScreen } from './skillScreen.js';
import { DEFAULT_MIN_ATTACK, DEFAULT_MAX_ATTACK } from '../../core/Skill.js';
import { Monster } from '../../core/Monster.js';

let selectedPlayerIndex = 0; // 0 for player 1, 1 for player 2
let gameState;
let battleSystemCallbacks;

import { playUpgradeSound, playClickSound } from '../../utils/audioUtils.js';

const handleMenuClick = (e) => {
    const target = e.target;
    const selectedPlayer = gameState.players[selectedPlayerIndex];

    const upgradeButton = target.closest('.upgrade-skill-button, .upgrade-hp-button');

    if (upgradeButton) {
        if (upgradeButton.dataset.type === 'skill') {
            const skillIndex = parseInt(upgradeButton.dataset.skillIndex);
            const skill = selectedPlayer.monster.skills[skillIndex];

            if (selectedPlayer.experience >= skill.requiredExp) {
                selectedPlayer.experience -= skill.requiredExp;
                skill.levelUp();
                gameState.saveState();
                renderMainMenu();
                playUpgradeSound();
            }
        } else if (upgradeButton.dataset.type === 'hp') {
            const monster = selectedPlayer.monster;
            if (selectedPlayer.experience >= monster.requiredHpExp) {
                selectedPlayer.experience -= monster.requiredHpExp;
                monster.levelUpHp();
                gameState.saveState();
                renderMainMenu();
                playUpgradeSound();
            }
        }
    } else { // 업그레이드 버튼이 아닌 경우
        playClickSound(); // 클릭 사운드 재생

        if (target.closest('.player-summary')) {
            selectedPlayerIndex = parseInt(target.closest('.player-summary').dataset.playerIndex);
            renderMainMenu();
        } else if (target.id === 'change-player-name-button') {
            showChangeNicknameScreen(selectedPlayerIndex + 1);
        } else if (target.id === 'change-monster-button') {
            const player = gameState.players[selectedPlayerIndex];
            const currentMonsterImage = player && player.monster ? player.monster.imageBase64 : null;
            showMonsterScreen(selectedPlayerIndex + 1, currentMonsterImage, (imageBase64) => {
                const monster = new Monster(imageBase64);
                if (player.monster) {
                    monster.skills = player.monster.skills;
                }
                player.monster = monster;
                gameState.saveState();
                showMainMenu(gameState, battleSystemCallbacks);
            }, () => showMainMenu(gameState, battleSystemCallbacks));
        } else if (target.id === 'change-skills-button') {
            const player = gameState.players[selectedPlayerIndex];
            const currentSkills = player && player.monster ? player.monster.skills : [{}, {}, {}];
            showSkillScreen(selectedPlayerIndex + 1, currentSkills, battleSystemCallbacks.skillSoundFiles, (skills) => {
                player.monster.skills = skills;
                gameState.saveState();
                showMainMenu(gameState, battleSystemCallbacks);
            }, () => showMainMenu(gameState, battleSystemCallbacks));
        } else if (target.id === 'start-battle-button') {
            battleSystemCallbacks.startBattleLogic();
        }
        else if (target.id === 'reset-exp-button') {
            showConfirmationModal('(주의) 전투와 관련된 모든 정보가 초기화 됩니다!', () => {
                gameState.players.forEach(player => {
                    if (player) {
                        player.experience = 0;
                        player.winCount = 0;
                        player.winningStreak = 0;
                        if (player.monster && player.monster.skills) {
                            player.monster.skills.forEach(skill => {
                                skill.level = 1;
                                skill.minAttack = DEFAULT_MIN_ATTACK;
                                skill.maxAttack = DEFAULT_MAX_ATTACK;
                            });
                            player.monster.hpLevel = 1; // hpLevel 초기화 추가
                        }
                    }
                });
                gameState.saveState();
                renderMainMenu();
            });
        }
    }
};

const showChangeNicknameScreen = (playerNumber) => {
    const player = gameState.players[playerNumber - 1];
    const html = `
        <h2>플레이어 ${playerNumber} 닉네임 변경</h2>
        <input type="text" id="nickname-input" value="${player.nickname}">
        <button id="save-nickname-button">저장</button>
        <button id="cancel-nickname-button">취소</button>
    `;
    renderScreen(html);

    // 닉네임 변경 화면의 이벤트는 일회성이므로 여기서 직접 등록
    document.getElementById('save-nickname-button').addEventListener('click', () => {
        playClickSound(); // 클릭 사운드 재생
        const newNickname = document.getElementById('nickname-input').value;
        if (newNickname && newNickname.trim() !== '') {
            player.nickname = newNickname.trim();
            gameState.saveState();
            showMainMenu(gameState, battleSystemCallbacks);
        } else {
            showAlertModal('닉네임을 입력해주세요.');
        }
    });

    document.getElementById('cancel-nickname-button').addEventListener('click', () => {
        playClickSound(); // 클릭 사운드 재생
        showMainMenu(gameState, battleSystemCallbacks);
    });
};

const renderMainMenu = () => {
    const player1 = gameState.players[0];
    const player2 = gameState.players[1];
    const selectedPlayer = gameState.players[selectedPlayerIndex];

    const playerInfoHTML = (player, playerNumber) => {
        if (!player) return `<div><h2>플레이어 ${playerNumber}</h2><p>설정 필요</p></div>`;
        return `
            <div class="player-summary ${selectedPlayerIndex === playerNumber - 1 ? 'selected' : ''}" data-player-index="${playerNumber - 1}">
                <h2>${player.nickname} (경험치: ${player.experience})</h2>
                <p>승리: ${player.winCount} | 연승: ${player.winningStreak}</p>
                <div class="monster-hp-area">
                    <img src="${player.monster.imageBase64}" width="100">
                    <div class="hp-info-and-button">
                        <span>체력 (Lv.${player.monster.hpLevel}) | ${player.monster.maxHp} HP</span>
                        ${selectedPlayerIndex === playerNumber - 1 ?
                            `<button class="upgrade-hp-button" data-type="hp" ${player.experience < player.monster.requiredHpExp ? 'disabled' : ''}>
                                업그레이드 (${player.monster.requiredHpExp} EXP)
                             </button>` : ''}
                    </div>
                </div>
                <div>
                    ${player.monster.skills.map((skill, index) => {
                        let skillInfoClass = 'skill-info-inactive'; // 기본은 선택되지 않은 플레이어의 어두운 배경
                        if (selectedPlayerIndex === playerNumber - 1) { // 현재 선택된 플레이어
                            if (player.experience < skill.requiredExp) {
                                skillInfoClass = 'skill-info-disabled'; // 붉은색
                            } else {
                                skillInfoClass = 'skill-info-active'; // 녹색
                            }
                        }
                        return `
                            <div class="skill-info ${skillInfoClass}">
                                <span>${skill.name} (Lv.${skill.level}) | ${skill.minAttack}~${skill.maxAttack}</span>
                                ${selectedPlayerIndex === playerNumber - 1 ?
                                    `<button class="upgrade-skill-button" data-type="skill" data-skill-index="${index}" ${player.experience < skill.requiredExp ? 'disabled' : ''}>
                                        업그레이드 (${skill.requiredExp} EXP)
                                     </button>` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;
    };

    const html = `
        <h1>전투 준비</h1>
        <div class="main-menu-layout">
            ${playerInfoHTML(player1, 1)}
            ${playerInfoHTML(player2, 2)}
        </div>
        <div class="menu-buttons">
            <p><strong>[ ${selectedPlayer.nickname} ]</strong> 설정 변경</p>
            <button id="change-player-name-button">플레이어 이름 변경</button>
            <button id="change-monster-button">몬스터 변경</button>
            <button id="change-skills-button">스킬 이름 변경</button>
            <hr>
            <button id="reset-exp-button" class="reset-exp-button">초기화</button>
            <button id="start-battle-button" class="start-battle-button">전투 시작</button>
        </div>
    `;
    renderScreen(html);
}

export const showMainMenu = (gs, callbacks) => {
    gameState = gs;
    battleSystemCallbacks = callbacks;

    renderMainMenu();

    const gameContainer = document.getElementById('game-container');
    // 기존 리스너가 있다면 제거 (중복 연결 방지)
    gameContainer.removeEventListener('click', handleMenuClick);
    // 새로운 리스너 연결
    gameContainer.addEventListener('click', handleMenuClick);
};

export const removeMainMenuListener = () => {
    const gameContainer = document.getElementById('game-container');
    gameContainer.removeEventListener('click', handleMenuClick);
};


