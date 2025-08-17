import { GameState } from './core/GameState.js';
import { Player } from './core/Player.js';
import { Monster } from './core/Monster.js';
import { Skill } from './core/Skill.js';
import { BattleSystem } from './core/BattleSystem.js';

let gameState;
let battleSystem;

// 화면 렌더링을 관리할 함수
const renderScreen = (html) => {
    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = html;
};

// 시작 화면을 렌더링하는 함수
const showStartScreen = () => {
    const html = `
        <h1>몬스터 격투 게임</h1>
        <button id="start-button">시작하기</button>
    `;
    renderScreen(html);

    document.getElementById('start-button').addEventListener('click', () => {
        checkGameState();
    });
};

// 닉네임 생성 화면
const showNicknameScreen = (playerNumber) => {
    const html = `
        <h2>플레이어 ${playerNumber} 닉네임 설정</h2>
        <input type="text" id="nickname-input" placeholder="닉네임을 입력하세요">
        <button id="save-nickname-button">저장</button>
    `;
    renderScreen(html);

    document.getElementById('save-nickname-button').addEventListener('click', () => {
        const nickname = document.getElementById('nickname-input').value;
        if (nickname) {
            const player = new Player(nickname);
            if (playerNumber === 1) {
                gameState.players[0] = player;
            } else {
                gameState.players[1] = player;
            }
            checkGameState();
        } else {
            alert('닉네임을 입력해주세요.');
        }
    });
};

// 몬스터 생성 화면
const showMonsterScreen = (playerNumber) => {
    const html = `
        <h2>플레이어 ${playerNumber} 몬스터 설정</h2>
        <p>몬스터 이미지를 업로드하세요.</p>
        <input type="file" id="monster-image-input" accept="image/*">
        <button id="save-monster-button">저장</button>
    `;
    renderScreen(html);

    document.getElementById('save-monster-button').addEventListener('click', () => {
        const input = document.getElementById('monster-image-input');
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const monster = new Monster(e.target.result);
                gameState.players[playerNumber - 1].monster = monster;
                checkGameState();
            };
            reader.readAsDataURL(input.files[0]);
        } else {
            alert('이미지를 업로드해주세요.');
        }
    });
};

// 스킬 생성 화면
const showSkillScreen = (playerNumber) => {
    const html = `
        <h2>플레이어 ${playerNumber} 스킬 설정</h2>
        <p>기본 스킬 3개의 이름을 정해주세요. (공격력: 0-5)</p>
        <input type="text" id="skill1-name" placeholder="스킬 1 이름">
        <input type="text" id="skill2-name" placeholder="스킬 2 이름">
        <input type="text" id="skill3-name" placeholder="스킬 3 이름">
        <button id="save-skills-button">저장</button>
    `;
    renderScreen(html);

    document.getElementById('save-skills-button').addEventListener('click', () => {
        const skill1Name = document.getElementById('skill1-name').value;
        const skill2Name = document.getElementById('skill2-name').value;
        const skill3Name = document.getElementById('skill3-name').value;

        if (skill1Name && skill2Name && skill3Name) {
            const skills = [
                new Skill(skill1Name, 0, 5),
                new Skill(skill2Name, 0, 5),
                new Skill(skill3Name, 0, 5)
            ];
            gameState.players[playerNumber - 1].monster.skills = skills;
            gameState.saveState(); // 현재 플레이어 설정 완료 후 저장
            checkGameState();
        } else {
            alert('모든 스킬의 이름을 입력해주세요.');
        }
    });
};

// 메인 메뉴 화면
const showMainMenu = () => {
    const player1 = gameState.players[0];
    const player2 = gameState.players[1];
    const html = `
        <h1>메인 메뉴</h1>
        <div style="display: flex; justify-content: space-around;">
            <div>
                <h2>플레이어 1: ${player1.nickname}</h2>
                <img src="${player1.monster.imageBase64}" width="150">
            </div>
            <div>
                <h2>플레이어 2: ${player2.nickname}</h2>
                <img src="${player2.monster.imageBase64}" width="150">
            </div>
        </div>
        <button id="start-battle-button">전투 시작</button>
    `;
    renderScreen(html);

    document.getElementById('start-battle-button').addEventListener('click', () => {
        const onTurnChange = () => {
            updateBattleScreen();
        };
        const onGameOver = (winner) => {
            showGameOverScreen(winner);
        };
        
        battleSystem = new BattleSystem(gameState.players[0], gameState.players[1], onTurnChange, onGameOver);
        battleSystem.startBattle();
        showBattleScreen();
    });
};

// 전투 화면 렌더링
const showBattleScreen = () => {
    const p1 = battleSystem.player1;
    const p2 = battleSystem.player2;

    const html = `
        <div class="battle-container">
            <div class="player-info" id="player1-info">
                <span>${p1.nickname}</span>
                <progress id="p1-hp" value="${p1.monster.hp}" max="100"></progress>
            </div>
            <div class="player-info" id="player2-info">
                <span>${p2.nickname}</span>
                <progress id="p2-hp" value="${p2.monster.hp}" max="100"></progress>
            </div>

            <div class="monster-area">
                <img src="${p1.monster.imageBase64}" class="monster" id="p1-monster">
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
    addSkillButtonListeners();
    updateBattleScreen(); 
};

// 전투 화면 정보 업데이트
const updateBattleScreen = () => {
    document.getElementById('p1-hp').value = battleSystem.player1.monster.hp;
    document.getElementById('p2-hp').value = battleSystem.player2.monster.hp;
    document.getElementById('turn-indicator').innerText = `${battleSystem.currentPlayer.nickname}의 턴`;
    updateSkillButtons();
};

// 스킬 버튼 이벤트 리스너 추가
const addSkillButtonListeners = () => {
    document.querySelectorAll('.skill-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const playerNumber = parseInt(e.target.dataset.player);
            const skillIndex = parseInt(e.target.dataset.skillIndex);
            const currentPlayerNumber = battleSystem.currentPlayer === battleSystem.player1 ? 1 : 2;

            if (playerNumber === currentPlayerNumber) {
                const skill = battleSystem.currentPlayer.monster.skills[skillIndex];
                battleSystem.attack(skill);
            }
        });
    });
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

// 게임 종료 화면
const showGameOverScreen = (winner) => {
    winner.experience += 10; // 승자에게 경험치 지급
    gameState.saveState();

    const html = `
        <h1>게임 종료</h1>
        <h2>승자: ${winner.nickname}</h2>
        <button id="back-to-menu-button">메인 메뉴로 돌아가기</button>
    `;
    renderScreen(html);

    document.getElementById('back-to-menu-button').addEventListener('click', () => {
        showMainMenu();
    });
};

// 게임 상태를 확인하고 다음 단계로 진행
const checkGameState = () => {
    if (!gameState.players[0]) {
        showNicknameScreen(1);
    } else if (!gameState.players[0].monster) {
        showMonsterScreen(1);
    } else if (gameState.players[0].monster.skills.length === 0) {
        showSkillScreen(1);
    } else if (!gameState.players[1]) {
        showNicknameScreen(2);
    } else if (!gameState.players[1].monster) {
        showMonsterScreen(2);
    } else if (gameState.players[1].monster.skills.length === 0) {
        showSkillScreen(2);
    } else {
        showMainMenu();
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
                player.experience = playerData.experience;
                if (playerData.monster) {
                    const monster = new Monster(playerData.monster.imageBase64);
                    monster.hp = playerData.monster.hp;
                    if (playerData.monster.skills) {
                        monster.skills = playerData.monster.skills.map(skillData => 
                            new Skill(skillData.name, skillData.minAttack, skillData.maxAttack)
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
    showStartScreen();
};

// 페이지 로드 시 게임 초기화 함수 호출
window.addEventListener('load', initGame);
