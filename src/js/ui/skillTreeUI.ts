import { InputManager } from '../input';
import { SkillTree } from '../skills/skillTree';
import { PlayerStats } from '../playerStats';
import { getSkillsByBranch, Skill, SkillBranch } from '../skills/skillData';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { sound } from '../sound';

const BRANCHES: SkillBranch[] = ['combat', 'defense', 'utility'];
const BRANCH_COLORS: Record<SkillBranch, { bg: string; accent: string; name: string }> = {
    combat: { bg: '#4a1a1a', accent: '#e74c3c', name: '⚔️ COMBAT' },
    defense: { bg: '#1a2a4a', accent: '#3498db', name: '🛡️ DEFENSE' },
    utility: { bg: '#1a4a2a', accent: '#2ecc71', name: '⚡ UTILITY' }
};

export class SkillTreeUI {
    visible: boolean;
    selectedBranch: number;
    selectedTier: number;
    message: string;
    messageTimer: number;

    constructor() {
        this.visible = false;
        this.selectedBranch = 0;
        this.selectedTier = 0;
        this.message = '';
        this.messageTimer = 0;
    }

    toggle(): void {
        this.visible = !this.visible;
        if (this.visible) {
            sound.menuSelect();
        }
    }

    isOpen(): boolean {
        return this.visible;
    }

    showMessage(text: string): void {
        this.message = text;
        this.messageTimer = 90;
    }

    update(input: InputManager, skillTree: SkillTree, playerStats: PlayerStats): void {
        if (!this.visible) return;

        if (this.messageTimer > 0) this.messageTimer--;

        if (input.isJustPressed('k') || input.isJustPressed('KeyK') || input.isCancel()) {
            this.toggle();
            return;
        }

        if (input.isMenuLeft()) {
            this.selectedBranch = (this.selectedBranch - 1 + 3) % 3;
            this.selectedTier = Math.min(this.selectedTier, 2);
            sound.menuSelect();
        }
        if (input.isMenuRight()) {
            this.selectedBranch = (this.selectedBranch + 1) % 3;
            this.selectedTier = Math.min(this.selectedTier, 2);
            sound.menuSelect();
        }

        if (input.isMenuUp()) {
            this.selectedTier = Math.max(0, this.selectedTier - 1);
            sound.menuSelect();
        }
        if (input.isMenuDown()) {
            this.selectedTier = Math.min(2, this.selectedTier + 1);
            sound.menuSelect();
        }

        if (input.isConfirm()) {
            const branch = BRANCHES[this.selectedBranch];
            const branchSkills = getSkillsByBranch(branch);
            const skill = branchSkills[this.selectedTier];

            if (skill) {
                const check = skillTree.canUnlock(skill, playerStats.skillPoints);
                if (check.allowed) {
                    skillTree.unlock(skill, playerStats);
                    this.showMessage(`Unlocked: ${skill.name}!`);
                    sound.purchase();
                } else {
                    this.showMessage(check.reason || 'Cannot unlock');
                    sound.error();
                }
            }
        }
    }

    draw(ctx: CanvasRenderingContext2D, skillTree: SkillTree, playerStats: PlayerStats): void {
        if (!this.visible) return;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        ctx.fillStyle = '#ffd700';
        ctx.font = '24px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('⭐ SKILL TREE ⭐', CANVAS_WIDTH / 2, 40);

        ctx.fillStyle = '#fff';
        ctx.font = '14px monospace';
        ctx.fillText(`Skill Points: ${playerStats.skillPoints}`, CANVAS_WIDTH / 2, 65);

        ctx.fillStyle = '#888';
        ctx.font = '10px monospace';
        ctx.fillText('(Earn 1 point each time you level up)', CANVAS_WIDTH / 2, 80);

        const branchWidth = 240;
        const startX = (CANVAS_WIDTH - branchWidth * 3 - 20) / 2;

        BRANCHES.forEach((branch, bIndex) => {
            const x = startX + bIndex * (branchWidth + 10);
            const isSelectedBranch = bIndex === this.selectedBranch;
            const colors = BRANCH_COLORS[branch];

            ctx.fillStyle = isSelectedBranch ? colors.bg : '#1a1a1a';
            ctx.fillRect(x, 95, branchWidth, 340);

            ctx.strokeStyle = isSelectedBranch ? colors.accent : '#333';
            ctx.lineWidth = isSelectedBranch ? 3 : 1;
            ctx.strokeRect(x, 95, branchWidth, 340);

            ctx.fillStyle = colors.accent;
            ctx.font = '12px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(colors.name, x + branchWidth / 2, 115);

            const branchSkills = getSkillsByBranch(branch);
            branchSkills.forEach((skill, sIndex) => {
                const skillY = 135 + sIndex * 100;
                const isSelected = isSelectedBranch && sIndex === this.selectedTier;
                const isUnlocked = skillTree.isUnlocked(skill.id);
                const canUnlock = skillTree.canUnlock(skill, playerStats.skillPoints).allowed;

                this.drawSkillNode(ctx, x + 20, skillY, branchWidth - 40, skill,
                    isSelected, isUnlocked, canUnlock, colors.accent);

                if (sIndex < branchSkills.length - 1) {
                    ctx.strokeStyle = isUnlocked ? colors.accent : '#444';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(x + branchWidth / 2, skillY + 75);
                    ctx.lineTo(x + branchWidth / 2, skillY + 100);
                    ctx.stroke();
                }
            });
        });

        if (this.messageTimer > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(CANVAS_WIDTH / 2 - 150, CANVAS_HEIGHT / 2 - 20, 300, 40);
            ctx.fillStyle = '#2ecc71';
            ctx.font = '14px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.message, CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 5);
        }

        ctx.fillStyle = '#666';
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('←→ Branch | ↑↓ Skill | ENTER Unlock | K/ESC Close',
            CANVAS_WIDTH / 2, CANVAS_HEIGHT - 15);
    }

    private drawSkillNode(
        ctx: CanvasRenderingContext2D,
        x: number, y: number, width: number,
        skill: Skill,
        isSelected: boolean,
        isUnlocked: boolean,
        canUnlock: boolean,
        accentColor: string
    ): void {
        if (isUnlocked) {
            ctx.fillStyle = accentColor;
        } else if (isSelected) {
            ctx.fillStyle = canUnlock ? '#3a3a3a' : '#2a2a2a';
        } else {
            ctx.fillStyle = '#222';
        }
        ctx.fillRect(x, y, width, 80);

        if (isSelected && !isUnlocked) {
            ctx.strokeStyle = canUnlock ? '#ffd700' : '#666';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, width, 80);
        }

        ctx.font = '24px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(skill.icon, x + 10, y + 35);

        ctx.fillStyle = isUnlocked ? '#fff' : (canUnlock ? '#ddd' : '#666');
        ctx.font = '12px monospace';
        ctx.fillText(skill.name, x + 45, y + 25);

        ctx.fillStyle = isUnlocked ? '#ccc' : '#888';
        ctx.font = '10px monospace';
        ctx.fillText(skill.description, x + 45, y + 42);

        ctx.fillStyle = isUnlocked ? '#2ecc71' : (canUnlock ? '#ffd700' : '#e74c3c');
        ctx.font = '10px monospace';
        ctx.textAlign = 'right';
        ctx.fillText(
            isUnlocked ? '✓ UNLOCKED' : `Cost: ${skill.tier} pt${skill.tier > 1 ? 's' : ''}`,
            x + width - 10, y + 70
        );

        if (!isUnlocked && !canUnlock) {
            ctx.font = '16px monospace';
            ctx.textAlign = 'center';
            ctx.fillStyle = '#666';
            ctx.fillText('🔒', x + width - 25, y + 35);
        }
    }
}
