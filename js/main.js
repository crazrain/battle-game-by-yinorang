import { GameState } from './core/GameState.js';
import { Player } from './core/Player.js';
import { Monster } from './core/Monster.js';
import { Skill, DEFAULT_MIN_ATTACK, DEFAULT_MAX_ATTACK } from './core/Skill.js';
import { BattleSystem } from './core/BattleSystem.js';
import { showConfirmationModal, showAlertModal } from './ui/modal.js';
import { renderScreen } from './ui/screenUtils.js';
import { showStartScreen } from './ui/screens/startScreen.js';

let gameState;
let battleSystem;

// 하드코딩된 스킬 사운드 파일 목록 (assets/audio/skill 폴더 기준)
const skillSoundFiles = [
    "skill/Chamelot_Delvigne_Model_1873_11_mm_Revolver_Single_Shot_07.wav",
    "skill/gun_grenade_launcher_shot_02.wav",
    "skill/HK53_Shot-01.wav",
    "skill/HK53_Shot-02.wav",
    "skill/Kalashnikov_AK_47_762_X_39_mm_Automatic_Rifle_Single_Shot_03.wav",
    "skill/L96A1_Shot-04.wav",
    "skill/Model 700_Shot-01.wav",
    "skill/Smith_Wesson_Chief_Special_38_Special_Revolver_Single_Shot_1_01.wav",
    "skill/tank_shot_1.wav",
    "skill/Uzi_Shot-03.wav"
];

// 랜덤 사운드 경로를 가져오는 헬퍼 함수
const getRandomSoundPath = () => {
    const randomIndex = Math.floor(Math.random() * skillSoundFiles.length);
    const soundPath = `assets/audio/${skillSoundFiles[randomIndex]}`;
    console.log('생성된 랜덤 사운드 경로:', soundPath);
    return soundPath;
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
            showAlertModal('닉네임을 입력해주세요.');
        }
    });
};

// 몬스터 생성 화면
const showMonsterScreen = (playerNumber, isFromMenu = false) => {
    const player = gameState.players[playerNumber - 1];
    const currentMonsterImage = (isFromMenu && player && player.monster) ? `<img src="${player.monster.imageBase64}" width="150" style="margin-bottom: 10px;">` : '';

    const html = `
        <h2>플레이어 ${playerNumber} 몬스터 설정</h2>
        ${currentMonsterImage}
        <p>몬스터 이미지를 업로드하세요.</p>
        <input type="file" id="monster-image-input" accept="image/*">
        <button id="save-monster-button">저장</button>
        <button id="cancel-monster-button">취소</button>
    `;
    renderScreen(html);

    document.getElementById('cancel-monster-button').addEventListener('click', () => {
        if (isFromMenu) {
            showMainMenu();
        } else {
            checkGameState();
        }
    });

    document.getElementById('save-monster-button').addEventListener('click', () => {
        const input = document.getElementById('monster-image-input');
        if (input.files && input.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const monster = new Monster(e.target.result);
                // 기존 스킬이 있다면 유지
                if (gameState.players[playerNumber - 1] && gameState.players[playerNumber - 1].monster) {
                    monster.skills = gameState.players[playerNumber - 1].monster.skills;
                }
                gameState.players[playerNumber - 1].monster = monster;
                
                if (isFromMenu) {
                    gameState.saveState();
                    showMainMenu();
                } else {
                    checkGameState();
                }
            };
            reader.readAsDataURL(input.files[0]);
        } else {
            showAlertModal('이미지를 업로드해주세요.');
        }
    });
};

// 스킬 생성 화면
const showSkillScreen = (playerNumber, isFromMenu = false) => {
    const player = gameState.players[playerNumber - 1];
    const currentSkills = (isFromMenu && player && player.monster && player.monster.skills) ? player.monster.skills : [{}, {}, {}];

    const html = `
        <h2>플레이어 ${playerNumber} 스킬 설정</h2>
        <p>스킬 3개의 이름을 정해주세요.</p>
        <input type="text" id="skill1-name" placeholder="스킬 1 이름" value="${currentSkills[0].name || ''}">
        <input type="text" id="skill2-name" placeholder="스킬 2 이름" value="${currentSkills[1].name || ''}">
        <input type="text" id="skill3-name" placeholder="스킬 3 이름" value="${currentSkills[2].name || ''}">
        <button id="save-skills-button">저장</button>
        <button id="cancel-skills-button">취소</button>
    `;
    renderScreen(html);

    document.getElementById('cancel-skills-button').addEventListener('click', () => {
        if (isFromMenu) {
            showMainMenu();
        } else {
            checkGameState();
        }
    });

    document.getElementById('save-skills-button').addEventListener('click', () => {
        const skill1Name = document.getElementById('skill1-name').value;
        const skill2Name = document.getElementById('skill2-name').value;
        const skill3Name = document.getElementById('skill3-name').value;

        if (skill1Name && skill2Name && skill3Name) {
            const skills = [
                new Skill(skill1Name, undefined, undefined, getRandomSoundPath()),
                new Skill(skill2Name, undefined, undefined, getRandomSoundPath()),
                new Skill(skill3Name, undefined, undefined, getRandomSoundPath())
            ];
            gameState.players[playerNumber - 1].monster.skills = skills;
            gameState.saveState();
            
            if (isFromMenu) {
                showMainMenu();
            } else {
                checkGameState();
            }
        } else {
            showAlertModal('모든 스킬의 이름을 입력해주세요.');
        }
    });
};

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
            showMainMenu();
        } else {
            showAlertModal('닉네임을 입력해주세요.');
        }
    });

    document.getElementById('cancel-nickname-button').addEventListener('click', () => {
        showMainMenu();
    });
};

let selectedPlayerIndex = 0; // 0 for player 1, 1 for player 2

// 전투 대기 화면 (메인 메뉴)
const showMainMenu = () => {
    const player1 = gameState.players[0];
    const player2 = gameState.players[1];
    const selectedPlayer = gameState.players[selectedPlayerIndex];

    const playerInfoHTML = (player, playerNumber) => {
        if (!player) return `<div><h2>플레이어 ${playerNumber}</h2><p>설정 필요</p></div>`;
        return `
            <div class="player-summary ${selectedPlayerIndex === playerNumber - 1 ? 'selected' : ''}" data-player-index="${playerNumber - 1}">
                <h2>플레이어 ${playerNumber}: ${player.nickname} (경험치: ${player.experience})</h2>
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
            showMainMenu(); // 다시 렌더링하여 선택 상태 업데이트
        });
    });

    // 설정 변경 버튼 이벤트 리스너
    document.getElementById('change-player-name-button').addEventListener('click', () => {
        showChangeNicknameScreen(selectedPlayerIndex + 1);
    });
    document.getElementById('change-monster-button').addEventListener('click', () => {
        showMonsterScreen(selectedPlayerIndex + 1, true); // 'isFromMenu' 플래그 전달
    });
    document.getElementById('change-skills-button').addEventListener('click', () => {
        showSkillScreen(selectedPlayerIndex + 1, true); // 'isFromMenu' 플래그 전달
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
                showMainMenu(); // 변경사항 반영하여 다시 렌더링
            }
        });
    });

    // 전투 시작 버튼 이벤트 리스너
    const startBattleLogic = () => {
        const onAttack = (log) => {
            const logEl = document.getElementById('battle-log');
            logEl.innerText = log;
            updateBattleScreen();
        };
        const onTurnChange = () => {
            updateBattleScreen();
        };
        const onGameOver = (winner) => {
            showGameOverScreen(winner);
        };
        
        battleSystem = new BattleSystem(gameState.players[0], gameState.players[1], onAttack, onTurnChange, onGameOver);
        battleSystem.startBattle();
        showBattleScreen();
    };

    document.getElementById('start-battle-button').addEventListener('click', startBattleLogic);

    // 경험치 초기화 버튼 이벤트 리스너
    document.getElementById('reset-exp-button').addEventListener('click', () => {
        showConfirmationModal('(주의) 경험치와 스킬 레벨이 모두 초기화 됩니다!', () => {
            gameState.players.forEach(player => {
                if (player) {
                    player.experience = 0;
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
            showMainMenu(); // 초기화 후 메뉴 새로고침
        });
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
                // Play skill sound
                const soundPathToPlay = getRandomSoundPath(); // 스킬 사용 시마다 새로운 랜덤 사운드 경로 가져오기
                if (soundPathToPlay) {
                    console.log('스킬 사운드 경로:', soundPathToPlay);
                    const sound = new Audio(soundPathToPlay);
                    sound.volume = 0.5; // Set volume
                    sound.play()
                        .then(() => {
                            console.log('스킬 사운드 재생 성공!');
                        })
                        .catch(error => {
                            console.error('스킬 사운드 재생 실패:', error);
                        });
                } else {
                    console.log('스킬 사운드 경로가 없습니다.');
                }
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
    // 승패에 따른 고정 경험치 지급 로직 제거
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
                            new Skill(skillData.name, skillData.minAttack, skillData.maxAttack, skillData.soundPath)
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
