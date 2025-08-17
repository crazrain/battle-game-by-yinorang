import { renderScreen } from '../screenUtils.js';
import { showAlertModal } from '../modal.js';
import { Skill } from '../../core/Skill.js';

export const getRandomSoundPath = (skillSoundFiles) => {
    const randomIndex = Math.floor(Math.random() * skillSoundFiles.length);
    const soundPath = `assets/audio/${skillSoundFiles[randomIndex]}`;
    console.log('생성된 랜덤 사운드 경로:', soundPath);
    return soundPath;
};

// 스킬 생성 화면
export const showSkillScreen = (playerNumber, currentSkills, skillSoundFiles, onSave, onCancel) => {
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

    document.getElementById('cancel-skills-button').addEventListener('click', onCancel);

    document.getElementById('save-skills-button').addEventListener('click', () => {
        const skill1Name = document.getElementById('skill1-name').value;
        const skill2Name = document.getElementById('skill2-name').value;
        const skill3Name = document.getElementById('skill3-name').value;

        if (skill1Name && skill2Name && skill3Name) {
            const skills = [
                new Skill(skill1Name, undefined, undefined, getRandomSoundPath(skillSoundFiles)),
                new Skill(skill2Name, undefined, undefined, getRandomSoundPath(skillSoundFiles)),
                new Skill(skill3Name, undefined, undefined, getRandomSoundPath(skillSoundFiles))
            ];
            onSave(skills);
        } else {
            showAlertModal('모든 스킬의 이름을 입력해주세요.');
        }
    });
};
