import { EquipmentType, EquipmentTier, EquipmentTierData } from './constants';
import type { Player } from './player';
import type { InputManager } from './input';

interface EquipmentUpgrade {
    tier: EquipmentTierData;
    price: number;
    name: string;
    description: string;
}

interface Consumable {
    id: string;
    name: string;
    price: number;
    description: string;
    effect: (player: Player) => void;
}

function isConsumable(item: EquipmentUpgrade | Consumable): item is Consumable {
    return 'effect' in item;
}

function isEquipmentUpgrade(item: EquipmentUpgrade | Consumable): item is EquipmentUpgrade {
    return 'tier' in item;
}

// Shop items configuration
const equipmentUpgrades: Record<string, EquipmentUpgrade[]> = {
    sword: [
        { tier: EquipmentTier.BASIC, price: 0, name: 'Wooden Sword', description: 'A basic training sword' },
        { tier: EquipmentTier.IRON, price: 100, name: 'Iron Sword', description: '+25% damage' },
        { tier: EquipmentTier.STEEL, price: 250, name: 'Steel Sword', description: '+50% damage' },
        { tier: EquipmentTier.GOLD, price: 500, name: 'Golden Blade', description: '+75% damage' },
        { tier: EquipmentTier.DIAMOND, price: 1000, name: 'Diamond Edge', description: '+100% damage' },
        { tier: EquipmentTier.LEGENDARY, price: 2000, name: 'Excalibur', description: '+150% damage' }
    ],
    armor: [
        { tier: EquipmentTier.BASIC, price: 0, name: 'Cloth Armor', description: 'Basic protection' },
        { tier: EquipmentTier.IRON, price: 120, name: 'Iron Armor', description: '+25% max HP' },
        { tier: EquipmentTier.STEEL, price: 300, name: 'Steel Plate', description: '+50% max HP' },
        { tier: EquipmentTier.GOLD, price: 600, name: 'Golden Mail', description: '+75% max HP' },
        { tier: EquipmentTier.DIAMOND, price: 1200, name: 'Diamond Armor', description: '+100% max HP' },
        { tier: EquipmentTier.LEGENDARY, price: 2500, name: 'Dragon Scale', description: '+150% max HP' }
    ],
    helmet: [
        { tier: EquipmentTier.BASIC, price: 0, name: 'Leather Cap', description: 'Basic headwear' },
        { tier: EquipmentTier.IRON, price: 80, name: 'Iron Helm', description: '+25% defense' },
        { tier: EquipmentTier.STEEL, price: 200, name: 'Steel Helm', description: '+50% defense' },
        { tier: EquipmentTier.GOLD, price: 400, name: 'Golden Crown', description: '+75% defense' },
        { tier: EquipmentTier.DIAMOND, price: 800, name: 'Diamond Visor', description: '+100% defense' },
        { tier: EquipmentTier.LEGENDARY, price: 1800, name: 'Helm of Ages', description: '+150% defense' }
    ],
    boots: [
        { tier: EquipmentTier.BASIC, price: 0, name: 'Sandals', description: 'Basic footwear' },
        { tier: EquipmentTier.IRON, price: 60, name: 'Iron Boots', description: '+5% speed' },
        { tier: EquipmentTier.STEEL, price: 150, name: 'Steel Greaves', description: '+10% speed' },
        { tier: EquipmentTier.GOLD, price: 350, name: 'Golden Steps', description: '+15% speed' },
        { tier: EquipmentTier.DIAMOND, price: 700, name: 'Diamond Dash', description: '+20% speed' },
        { tier: EquipmentTier.LEGENDARY, price: 1500, name: 'Hermes Wings', description: '+30% speed' }
    ]
};

const consumables: Consumable[] = [
    { id: 'health_potion', name: 'Health Potion', price: 30, description: 'Restore 50 HP', effect: (player) => player.heal(50) },
    { id: 'full_heal', name: 'Full Restore', price: 100, description: 'Restore all HP', effect: (player) => player.heal(player.maxHealth) }
];

export class Shop {
    selectedCategory: number;
    selectedItem: number;
    categories: string[];
    message: string;
    messageTimer: number;

    constructor() {
        this.selectedCategory = 0; // 0=sword, 1=armor, 2=helmet, 3=boots, 4=consumables
        this.selectedItem = 0;
        this.categories = ['sword', 'armor', 'helmet', 'boots', 'items'];
        this.message = '';
        this.messageTimer = 0;
    }

    getAvailableUpgrades(player: Player, category: string): (EquipmentUpgrade | Consumable)[] {
        if (category === 'items') {
            return consumables;
        }

        const upgrades = equipmentUpgrades[category];
        const currentTier = player.equipment[category];
        const currentIndex = upgrades.findIndex(u => u.tier.name === currentTier.name);

        // Return next available upgrade if any
        return upgrades.slice(currentIndex + 1, currentIndex + 4);
    }

    getCurrentEquipment(player: Player, category: string): EquipmentUpgrade | null | undefined {
        if (category === 'items') return null;
        const upgrades = equipmentUpgrades[category];
        const currentTier = player.equipment[category];
        return upgrades.find(u => u.tier.name === currentTier.name);
    }

    canAfford(player: Player, item: EquipmentUpgrade | Consumable): boolean {
        return player.gold >= item.price;
    }

    purchase(player: Player, category: string, item: EquipmentUpgrade | Consumable): boolean {
        if (!this.canAfford(player, item)) {
            this.showMessage('Not enough gold!');
            return false;
        }

        player.gold -= item.price;

        if (isConsumable(item)) {
            // Consumable
            item.effect(player);
            this.showMessage(`Used ${item.name}!`);
        } else if (isEquipmentUpgrade(item)) {
            // Equipment upgrade
            player.equipment[category as keyof typeof player.equipment] = item.tier;
            player.calculateStats();
            this.showMessage(`Equipped ${item.name}!`);
        }

        return true;
    }

    showMessage(text: string) {
        this.message = text;
        this.messageTimer = 120;
    }

    update(input: InputManager, player: Player): boolean {
        if (this.messageTimer > 0) {
            this.messageTimer--;
        }

        // Category navigation
        if (input.isMenuLeft()) {
            this.selectedCategory = (this.selectedCategory - 1 + this.categories.length) % this.categories.length;
            this.selectedItem = 0;
        }
        if (input.isMenuRight()) {
            this.selectedCategory = (this.selectedCategory + 1) % this.categories.length;
            this.selectedItem = 0;
        }

        // Item navigation
        const category = this.categories[this.selectedCategory];
        const items = this.getAvailableUpgrades(player, category);

        if (input.isMenuUp()) {
            this.selectedItem = Math.max(0, this.selectedItem - 1);
        }
        if (input.isMenuDown()) {
            this.selectedItem = Math.min(items.length - 1, this.selectedItem + 1);
        }

        // Purchase
        if (input.isConfirm() && items.length > 0) {
            const item = items[this.selectedItem];
            if (item) {
                this.purchase(player, category, item);
            }
        }

        return !input.isCancel(); // Return false to exit shop
    }

    draw(ctx: CanvasRenderingContext2D, player: Player, width: number, height: number) {
        // Darken background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(0, 0, width, height);

        // Title
        ctx.fillStyle = '#ffd700';
        ctx.font = '28px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('SHOP', width / 2, 50);

        // Gold display
        ctx.fillStyle = '#ffd700';
        ctx.font = '14px "Press Start 2P", monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`Gold: ${player.gold}`, width - 30, 50);

        // Category tabs
        const tabWidth = 140;
        const tabStartX = (width - tabWidth * this.categories.length) / 2;

        ctx.font = '12px "Press Start 2P", monospace';
        this.categories.forEach((cat, i) => {
            const x = tabStartX + i * tabWidth;
            const isSelected = i === this.selectedCategory;

            ctx.fillStyle = isSelected ? '#3498db' : '#2c3e50';
            ctx.fillRect(x, 80, tabWidth - 5, 35);

            ctx.fillStyle = isSelected ? '#fff' : '#7f8c8d';
            ctx.textAlign = 'center';
            ctx.fillText(cat.toUpperCase(), x + tabWidth / 2 - 2, 103);
        });

        // Current equipment display
        const category = this.categories[this.selectedCategory];
        const currentEquip = this.getCurrentEquipment(player, category);

        if (currentEquip) {
            ctx.fillStyle = '#2c3e50';
            ctx.fillRect(50, 130, 300, 80);

            ctx.fillStyle = '#95a5a6';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.textAlign = 'left';
            ctx.fillText('EQUIPPED:', 60, 155);

            ctx.fillStyle = currentEquip.tier.color;
            ctx.font = '12px "Press Start 2P", monospace';
            ctx.fillText(currentEquip.name, 60, 180);

            ctx.fillStyle = '#7f8c8d';
            ctx.font = '10px "Press Start 2P", monospace';
            ctx.fillText(currentEquip.description, 60, 200);
        }

        // Player stats
        ctx.fillStyle = '#2c3e50';
        ctx.fillRect(450, 130, 300, 80);

        ctx.fillStyle = '#fff';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`DMG: ${player.damage}`, 460, 155);
        ctx.fillText(`HP: ${player.health}/${player.maxHealth}`, 460, 175);
        ctx.fillText(`DEF: ${player.defense}`, 460, 195);
        ctx.fillText(`LVL: ${player.level}`, 600, 155);
        ctx.fillText(`EXP: ${player.exp}/${player.expToNextLevel}`, 600, 175);

        // Available items
        const items = this.getAvailableUpgrades(player, category);

        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(50, 230, 700, 220);

        if (items.length === 0) {
            ctx.fillStyle = '#7f8c8d';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText('No upgrades available', width / 2, 340);
            ctx.fillText('(Max level reached!)', width / 2, 370);
        } else {
            items.forEach((item, i) => {
                const y = 255 + i * 60;
                const isSelected = i === this.selectedItem;
                const canAfford = this.canAfford(player, item);

                // Selection highlight
                if (isSelected) {
                    ctx.fillStyle = 'rgba(52, 152, 219, 0.3)';
                    ctx.fillRect(55, y - 20, 690, 55);
                }

                // Item name
                ctx.fillStyle = isEquipmentUpgrade(item) ? item.tier.color : '#3498db';
                if (!canAfford) ctx.fillStyle = '#e74c3c';
                ctx.font = '12px "Press Start 2P", monospace';
                ctx.textAlign = 'left';
                ctx.fillText(item.name, 70, y);

                // Description
                ctx.fillStyle = '#7f8c8d';
                ctx.font = '10px "Press Start 2P", monospace';
                ctx.fillText(item.description, 70, y + 20);

                // Price
                ctx.fillStyle = canAfford ? '#ffd700' : '#e74c3c';
                ctx.textAlign = 'right';
                ctx.fillText(`${item.price} G`, 720, y);
            });
        }

        // Message
        if (this.messageTimer > 0) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.fillRect(width / 2 - 150, height / 2 - 30, 300, 60);

            ctx.fillStyle = '#2ecc71';
            ctx.font = '14px "Press Start 2P", monospace';
            ctx.textAlign = 'center';
            ctx.fillText(this.message, width / 2, height / 2 + 5);
        }

        // Controls hint
        ctx.fillStyle = '#5d6d7e';
        ctx.font = '10px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('← → Categories | ↑ ↓ Select | ENTER Buy | ESC Exit', width / 2, height - 20);
    }
}
