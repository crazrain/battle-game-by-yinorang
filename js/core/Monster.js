export class Monster {
    constructor(imageBase64) {
        this.imageBase64 = imageBase64;
        this.hp = 100; // 기본 HP
        this.skills = []; // Skill 객체 3개를 담을 배열
    }
}
