import { renderScreen } from '../screenUtils.js';
import { getRandomSoundPath } from './skillScreen.js';

let battleSystem;
let skillSoundFiles;
let onBackToMenu;
let eventListenerAttached = false;
let previousP1Hp;
let previousP2Hp;

const handleBattleClick = (e) => {
    const target = e.target;

    if (target.classList.contains('skill-button')) {
        const playerNumber = parseInt(target.dataset.player);
        const skillIndex = parseInt(target.dataset.skillIndex);
        const currentPlayerNumber = battleSystem.currentPlayer === battleSystem.player1 ? 1 : 2;

        if (playerNumber === currentPlayerNumber) {
            const skill = battleSystem.currentPlayer.monster.skills[skillIndex];
            const soundPathToPlay = getRandomSoundPath(skillSoundFiles);
            if (soundPathToPlay) {
                const sound = new Audio(soundPathToPlay);
                sound.volume = 0.5;
                sound.play().catch(error => console.error('스킬 사운드 재생 실패:', error));
            }
            battleSystem.attack(skill);
        }
    } else if (target.id === 'back-to-menu-button') {
        onBackToMenu();
    }
};

// 데미지 텍스트 애니메이션 표시
const showDamage = (damage, opponent) => {
    const monsterArea = document.querySelector('.monster-area');
    if (!monsterArea) return;

    const damageText = document.createElement('div');
    damageText.className = 'damage-text';
    damageText.textContent = `-${damage}`;

    // 피격자 몬스터 이미지 위치 기준으로 데미지 텍스트 위치 설정
    const opponentMonsterImg = opponent === battleSystem.player1 ? document.getElementById('p1-monster') : document.getElementById('p2-monster');
    if (opponentMonsterImg) {
        const rect = opponentMonsterImg.getBoundingClientRect();
        const containerRect = monsterArea.getBoundingClientRect();
        damageText.style.left = `${rect.left - containerRect.left + rect.width / 2}px`;
        damageText.style.top = `${rect.top - containerRect.top}px`;
    }


    monsterArea.appendChild(damageText);

    // 애니메이션이 끝나면 요소 제거
    damageText.addEventListener('animationend', () => {
        damageText.remove();
    });
};


// 전투 화면 정보 업데이트
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const updateBattleScreen = () => {
    if (!battleSystem) return;

    const players = [
        {
            monster: battleSystem.player1.monster,
            prevHp: previousP1Hp,
            hpBar: document.getElementById('p1-hp'),
            overlay: document.getElementById('p1-damage-overlay'),
            setPrevHp: (v) => (previousP1Hp = v),
        },
        {
            monster: battleSystem.player2.monster,
            prevHp: previousP2Hp,
            hpBar: document.getElementById('p2-hp'),
            overlay: document.getElementById('p2-damage-overlay'),
            setPrevHp: (v) => (previousP2Hp = v),
        },
    ];

    const applyDamageOverlay = ({ monster, prevHp, hpBar, overlay, setPrevHp }) => {
        if (!hpBar || !overlay) return;
        const maxHp = monster.maxHp ?? 100;
        const curr = clamp(monster.hp, 0, maxHp);
        const prev = clamp(prevHp ?? maxHp, 0, maxHp);

        if ('max' in hpBar) hpBar.max = maxHp;

        if (curr >= prev) {
            hpBar.value = curr;
            setPrevHp(curr);
            return;
        }

        if (overlay._fadeTimer) {
            clearTimeout(overlay._fadeTimer);
            overlay._fadeTimer = null;
        }

        const damagePct = ((prev - curr) / maxHp) * 100;
        const prevPct = (prev / maxHp) * 100;

        overlay.style.transition = 'none';
        overlay.style.opacity = 0;
        overlay.style.width = `${Math.max(0, damagePct)}%`;
        overlay.style.right = `${Math.max(0, 100 - prevPct)}%`;

        overlay.offsetWidth;

        overlay.style.transition = 'opacity 1s ease-out';
        overlay.style.opacity = 1;

        overlay._fadeTimer = setTimeout(() => {
            overlay.style.opacity = 0;
            overlay._fadeTimer = null;
        }, 1000);

        overlay.addEventListener(
            'transitionend',
            (e) => {
                if (e.propertyName !== 'opacity') return;
                hpBar.value = curr;
                if (!battleSystem.isGameOver && battleSystem.checkGameOver()) {
                    return;
                }
            },
            { once: true }
        );

        setPrevHp(curr);
    };

    players.forEach(applyDamageOverlay);

    const turnIndicator = document.getElementById('turn-indicator');
    if (turnIndicator) {
        turnIndicator.innerText = `${battleSystem.currentPlayer.nickname}의 턴`;
    }
    updateSkillButtons();
};

// 현재 턴에 따라 스킬 버튼 활성화/비활성화
const updateSkillButtons = () => {
    if (!battleSystem) return;
    const p1_skills = document.querySelectorAll('#p1-skills .skill-button');
    const p2_skills = document.querySelectorAll('#p2-skills .skill-button');

    if (!p1_skills.length || !p2_skills.length) return;

    if (battleSystem.currentPlayer === battleSystem.player1) {
        p1_skills.forEach(b => b.disabled = false);
        p2_skills.forEach(b => b.disabled = true);
    } else {
        p1_skills.forEach(b => b.disabled = true);
        p2_skills.forEach(b => b.disabled = false);
    }
};

// 게임 종료 화면
const showGameOverScreen = (winner) => {
    const html = `
        <h1>게임 종료</h1>
        <h2>승자: ${winner.nickname}</h2>
        <div class="game-over-stats">
            <p class="stat-item">승리: <span>${winner.winCount}</span></p>
            <p class="stat-item">연승: <span>${winner.winningStreak}</span></p>
        </div>
        <button id="back-to-menu-button">전투 준비 화면으로 돌아가기</button>
    `;
    renderScreen(html);
};

const renderBattleScreen = () => {
    const p1 = battleSystem.player1;
    const p2 = battleSystem.player2;

    const html = `
        <div class="battle-container">
            <div class="player-info" id="player1-info">
                <span>${p1.nickname}</span>
                <div class="hp-bar-container">
                    <progress id="p1-hp" value="${p1.monster.hp}" max="100"></progress>
                    <div id="p1-damage-overlay" class="damage-overlay"></div>
                </div>
            </div>
            <div class="player-info" id="player2-info">
                <span>${p2.nickname}</span>
                <div class="hp-bar-container">
                    <progress id="p2-hp" value="${p2.monster.hp}" max="100"></progress>
                    <div id="p2-damage-overlay" class="damage-overlay"></div>
                </div>
            </div>

            <div class="monster-area">
                <img src="${p1.monster.imageBase64}" class="monster" id="p1-monster">
                <div id="battle-log" class="battle-log"></div>
                <img src="${p2.monster.imageBase64}" class="monster" id="p2-monster">
            </div>

            <div class="skills-area">
                <div class="player-skills" id="p1-skills">
                    ${p1.monster.skills.map((skill, index) => `<button class="skill-button" data-player="1" data-skill-index="${index}">${skill.name}</button>`).join('')}
                </div>
                <div class="player-skills" id="p2-skills">
                    ${p2.monster.skills.map((skill, index) => `<button class="skill-button" data-player="2" data-skill-index="${index}">${skill.name}</button>`).join('')}
                </div>
            </div>
            <div id="turn-indicator"></div>
        </div>
    `;
    renderScreen(html);
    updateBattleScreen();
}

export const showBattleScreen = (bs, sounds, backToMenuCallback) => {
    battleSystem = bs;
    skillSoundFiles = sounds;
    onBackToMenu = backToMenuCallback;
    previousP1Hp = battleSystem.player1.monster.maxHp ?? 100;
    previousP2Hp = battleSystem.player2.monster.maxHp ?? 100;

    renderBattleScreen();

    if (!eventListenerAttached) {
        const gameContainer = document.getElementById('game-container');
        gameContainer.addEventListener('click', handleBattleClick);
        eventListenerAttached = true;
    }

    battleSystem.onAttack = (log, damage, opponent) => {
        const logEl = document.getElementById('battle-log');
        if (logEl) logEl.innerText = log;
        showDamage(damage, opponent);
        updateBattleScreen();
    };
    battleSystem.onTurnChange = () => {
        updateBattleScreen();
    };
    battleSystem.onGameOver = (winner) => {
        showGameOverScreen(winner);
    };
};

export const removeBattleScreenListener = () => {
    if (eventListenerAttached) {
        const gameContainer = document.getElementById('game-container');
        gameContainer.removeEventListener('click', handleBattleClick);
        eventListenerAttached = false;
    }
};
