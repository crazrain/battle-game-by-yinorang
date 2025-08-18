import { renderScreen } from '../screenUtils.js';
import { showAlertModal, showConfirmationModal } from '../modal.js';
import { showMonsterScreen } from './monsterScreen.js';
import { showSkillScreen } from './skillScreen.js';
import { DEFAULT_MIN_ATTACK, DEFAULT_MAX_ATTACK } from '../../core/Skill.js';

let selectedPlayerIndex = 0; // 0 for player 1, 1 for player 2
let gameState;
let battleSystemCallbacks;

// 닉네임 변경 화면 (메인 메뉴에서 호출)
const showChangeNicknameScreen = (playerNumber) => {
    const player = gameState.players[playerNumber - 1];
    const html = `
        <h2>플레이어 ${playerNumber} 닉네임 변경</h2>
        <input type="text" id="nickname-input" value="${player.nickname}">
        <button id="save-nickname-button">저장</button>
        <button id="cancel-nickname-button">취소</button>
    `;
    renderScreen(html);

    document.getElementById('save-nickname-button').addEventListener('click', () => {
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
        showMainMenu(gameState, battleSystemCallbacks);
    });
};

// 전투 대기 화면 (메인 메뉴)
export const showMainMenu = (gs, callbacks) => {
    gameState = gs;
    battleSystemCallbacks = callbacks;
    const player1 = gameState.players[0];
    const player2 = gameState.players[1];
    const selectedPlayer = gameState.players[selectedPlayerIndex];

    const playerInfoHTML = (player, playerNumber) => {
        if (!player) return `<div><h2>플레이어 ${playerNumber}</h2><p>설정 필요</p></div>`;
        return `
            <div class="player-summary ${selectedPlayerIndex === playerNumber - 1 ? 'selected' : ''}" data-player-index="${playerNumber - 1}">
                <h2>플레이어 ${playerNumber}: ${player.nickname} (경험치: ${player.experience})</h2>
                <p>승리: ${player.winCount} | 연승: ${player.winningStreak}</p>
                <img src="${player.monster.imageBase64}" width="100">
                <div>
                    ${player.monster.skills.map((skill, index) => `
                        <div class="skill-info">
                            <span>${skill.name} (Lv.${skill.level}) | ${skill.minAttack}~${skill.maxAttack}</span>
                            ${selectedPlayerIndex === playerNumber - 1 ? 
                                `<button class="upgrade-skill-button" data-skill-index="${index}" ${player.experience < skill.requiredExp ? 'disabled' : ''}>
                                    업그레이드 (${skill.requiredExp} EXP)
                                 </button>` : ''}
                        </div>
                    `).join('')}
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

    // 플레이어 선택 이벤트 리스너
    document.querySelectorAll('.player-summary').forEach(el => {
        el.addEventListener('click', (e) => {
            selectedPlayerIndex = parseInt(e.currentTarget.dataset.playerIndex);
            showMainMenu(gameState, battleSystemCallbacks); // 다시 렌더링하여 선택 상태 업데이트
        });
    });

    // 설정 변경 버튼 이벤트 리스너
    document.getElementById('change-player-name-button').addEventListener('click', () => {
        showChangeNicknameScreen(selectedPlayerIndex + 1);
    });
    document.getElementById('change-monster-button').addEventListener('click', () => {
        const player = gameState.players[selectedPlayerIndex];
        const currentMonsterImage = player && player.monster ? player.monster.imageBase64 : null;
        showMonsterScreen(selectedPlayerIndex + 1, currentMonsterImage, (imageBase64) => {
            const monster = new Monster(imageBase64);
            // 기존 스킬이 있다면 유지
            if (player.monster) {
                monster.skills = player.monster.skills;
            }
            player.monster = monster;
            gameState.saveState();
            showMainMenu(gameState, battleSystemCallbacks);
        }, () => showMainMenu(gameState, battleSystemCallbacks));
    });
    document.getElementById('change-skills-button').addEventListener('click', () => {
        const player = gameState.players[selectedPlayerIndex];
        const currentSkills = player && player.monster ? player.monster.skills : [{}, {}, {}];
        showSkillScreen(selectedPlayerIndex + 1, currentSkills, battleSystemCallbacks.skillSoundFiles, (skills) => {
            player.monster.skills = skills;
            gameState.saveState();
            showMainMenu(gameState, battleSystemCallbacks);
        }, () => showMainMenu(gameState, battleSystemCallbacks));
    });

    // 스킬 업그레이드 버튼 이벤트 리스너
    document.querySelectorAll('.upgrade-skill-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const skillIndex = parseInt(e.target.dataset.skillIndex);
            const skill = selectedPlayer.monster.skills[skillIndex];
            if (selectedPlayer.experience >= skill.requiredExp) {
                selectedPlayer.experience -= skill.requiredExp;
                skill.levelUp();
                gameState.saveState();
                showMainMenu(gameState, battleSystemCallbacks); // 변경사항 반영하여 다시 렌더링
            }
        });
    });

    // 전투 시작 버튼 이벤트 리스너
    document.getElementById('start-battle-button').addEventListener('click', battleSystemCallbacks.startBattleLogic);

    // 경험치 초기화 버튼 이벤트 리스너
    document.getElementById('reset-exp-button').addEventListener('click', () => {
        showConfirmationModal('(주의) 전투와 관련된 모든 정보가 초기화 됩니다!', () => {
            gameState.players.forEach(player => {
                if (player) {
                    player.experience = 0;
                    player.winCount = 0; // 승리 횟수 초기화 추가
                    player.winningStreak = 0; // 연승수 초기화 추가
                    if (player.monster && player.monster.skills) {
                        player.monster.skills.forEach(skill => {
                            skill.level = 1; // 스킬 레벨도 초기화
                            skill.minAttack = DEFAULT_MIN_ATTACK; // 스킬 공격력도 초기화
                            skill.maxAttack = DEFAULT_MAX_ATTACK;
                        });
                    }
                }
            });
            gameState.saveState();
            showMainMenu(gameState, battleSystemCallbacks); // 초기화 후 메뉴 새로고침
        });
    });
};