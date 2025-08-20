import { renderScreen } from '../screenUtils.js';
import { showAlertModal } from '../modal.js';
import { Skill } from '../../core/Skill.js';
import { playClickSound } from '../../utils/audioUtils.js';

export const getRandomSoundPath = (skillSoundFiles) => {
    const randomIndex = Math.floor(Math.random() * skillSoundFiles.length);
    const soundPath = `assets/audio/${skillSoundFiles[randomIndex]}`;
    return soundPath;
};

let onSaveSkillsCallback;
let onCancelSkillsCallback;
let saveSkillsButton;
let cancelSkillsButton;
let skill1NameInput;
let skill2NameInput;
let skill3NameInput;
let currentSkillSoundFiles; // skillSoundFiles를 저장할 변수 추가

const handleCancelSkillsClick = () => {
    playClickSound();
    if (onCancelSkillsCallback) {
        onCancelSkillsCallback();
    }
};

const handleSaveSkillsClick = () => {
    playClickSound();
    const skill1Name = skill1NameInput.value;
    const skill2Name = skill2NameInput.value;
    const skill3Name = skill3NameInput.value;

    if (skill1Name && skill2Name && skill3Name) {
        const skills = [
            new Skill(skill1Name, undefined, undefined, 1, getRandomSoundPath(currentSkillSoundFiles)),
            new Skill(skill2Name, undefined, undefined, 1, getRandomSoundPath(currentSkillSoundFiles)),
            new Skill(skill3Name, undefined, undefined, 1, getRandomSoundPath(currentSkillSoundFiles))
        ];
        if (onSaveSkillsCallback) {
            onSaveSkillsCallback(skills);
        }
    } else {
        showAlertModal('모든 스킬의 이름을 입력해주세요.');
    }
};

// 스킬 생성 화면
export const showSkillScreen = (playerNumber, currentSkills, skillSoundFiles, onSave, onCancel) => {
    onSaveSkillsCallback = onSave;
    onCancelSkillsCallback = onCancel;
    currentSkillSoundFiles = skillSoundFiles; // skillSoundFiles 저장

    const html = `
        <h2>플레이어 ${playerNumber} 스킬 설정</h2>
        <p>스킬 3개의 이름을 정해주세요.</p>
        <input type="text" id="skill1-name" placeholder="스킬 1 이름" value="${currentSkills[0]?.name || ''}">
        <input type="text" id="skill2-name" placeholder="스킬 2 이름" value="${currentSkills[1]?.name || ''}">
        <input type="text" id="skill3-name" placeholder="스킬 3 이름" value="${currentSkills[2]?.name || ''}">
        <button id="save-skills-button">저장</button>
        <button id="cancel-skills-button">취소</button>
    `;
    renderScreen(html);

    skill1NameInput = document.getElementById('skill1-name');
    skill2NameInput = document.getElementById('skill2-name');
    skill3NameInput = document.getElementById('skill3-name');
    saveSkillsButton = document.getElementById('save-skills-button');
    cancelSkillsButton = document.getElementById('cancel-skills-button');

    if (cancelSkillsButton) {
        cancelSkillsButton.addEventListener('click', handleCancelSkillsClick);
    }
    if (saveSkillsButton) {
        saveSkillsButton.addEventListener('click', handleSaveSkillsClick);
    }
};

export const removeSkillScreenListener = () => {
    if (cancelSkillsButton) {
        cancelSkillsButton.removeEventListener('click', handleCancelSkillsClick);
        cancelSkillsButton = null;
    }
    if (saveSkillsButton) {
        saveSkillsButton.removeEventListener('click', handleSaveSkillsClick);
        saveSkillsButton = null;
    }
    skill1NameInput = null;
    skill2NameInput = null;
    skill3NameInput = null;
    onSaveSkillsCallback = null;
    onCancelSkillsCallback = null;
    currentSkillSoundFiles = null;
};
