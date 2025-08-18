import { renderScreen } from '../screenUtils.js';
import { getRandomSoundPath } from './skillScreen.js';

let battleSystem;
let previousP1Hp = 100;
let previousP2Hp = 100;
let onBackToMenu;

// 전투 화면 정보 업데이트
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

const updateBattleScreen = () => {
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

        const oldTransition = overlay.style.transition;
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

    document.getElementById('turn-indicator').innerText =
        `${battleSystem.currentPlayer.nickname}의 턴`;
    updateSkillButtons();
};

// 현재 턴에 따라 스킬 버튼 활성화/비활성화
const updateSkillButtons = () => {
    const p1_skills = document.querySelectorAll('#p1-skills .skill-button');
    const p2_skills = document.querySelectorAll('#p2-skills .skill-button');

    if (battleSystem.currentPlayer === battleSystem.player1) {
        p1_skills.forEach(b => b.disabled = false);
        p2_skills.forEach(b => b.disabled = true);
    } else {
        p1_skills.forEach(b => b.disabled = true);
        p2_skills.forEach(b => b.disabled = false);
    }
};

// 스킬 버튼 이벤트 리스너 추가
const addSkillButtonListeners = (skillSoundFiles) => {
    document.querySelectorAll('.skill-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const playerNumber = parseInt(e.target.dataset.player);
            const skillIndex = parseInt(e.target.dataset.skillIndex);
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
        });
    });
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

    document.getElementById('back-to-menu-button').addEventListener('click', onBackToMenu);
};

// 전투 화면 렌더링
export const showBattleScreen = (bs, skillSoundFiles, backToMenuCallback) => {
    battleSystem = bs;
    onBackToMenu = backToMenuCallback;
    previousP1Hp = battleSystem.player1.monster.maxHp ?? 100;
    previousP2Hp = battleSystem.player2.monster.maxHp ?? 100;

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
    addSkillButtonListeners(skillSoundFiles);
    updateBattleScreen();

    // BattleSystem 콜백 설정
    battleSystem.onAttack = (log) => {
        const logEl = document.getElementById('battle-log');
        if(logEl) logEl.innerText = log;
        updateBattleScreen();
    };
    battleSystem.onTurnChange = () => {
        updateBattleScreen();
    };
    battleSystem.onGameOver = (winner) => {
        showGameOverScreen(winner);
    };
};