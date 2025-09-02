import Phaser from 'phaser';
import { NPC } from '../entities/NPC';

export class DialogManager {
  private scene: Phaser.Scene;
  private dialogContainer?: Phaser.GameObjects.Container;
  private currentNPC?: NPC;
  private currentIndex: number = 0;
  private isDialogActive: boolean = false;
  private keyboardControls?: { enter: Phaser.Input.Keyboard.Key; esc: Phaser.Input.Keyboard.Key };
  
  public onScenarioStart?: (scenarioId: string) => void;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public startDialog(npc: NPC): void {
    if (this.isDialogActive) return;

    this.currentNPC = npc;
    this.currentIndex = 0;
    this.isDialogActive = true;

    this.createDialogBox();
    this.updateDialogContent();
    this.setupKeyboardControls();
  }

  private createDialogBox(): void {
    if (!this.currentNPC) return;

    // Create container
    this.dialogContainer = this.scene.add.container(400, 500);
    this.dialogContainer.setDepth(200);

    // Background
    const bg = this.scene.add.image(0, 0, 'dialog-bg');
    bg.setScale(2, 1);

    // NPC portrait
    const portrait = this.scene.add.image(-350, -20, `npc-${this.currentNPC.spriteKey}`);
    portrait.setScale(2);

    // Name text
    const nameText = this.scene.add.text(-300, -60, this.currentNPC.npcName, {
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#4A90E2'
    });

    // Dialog text (will be updated)
    const dialogText = this.scene.add.text(-300, -30, '', {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 550, useAdvancedWrap: true }
    });

    // Buttons container
    const buttonsContainer = this.scene.add.container(0, 50);

    // Next button
    const nextBtn = this.createButton(-100, 0, 'Next', '#4A90E2', () => {
      this.nextDialog();
    });

    // Start scenario button
    const startBtn = this.createButton(100, 0, 'Start Scenario', '#28a745', () => {
      this.startScenario();
    });

    // Close button
    const closeBtn = this.createButton(300, 0, 'Close', '#dc3545', () => {
      this.closeDialog();
    });

    buttonsContainer.add([nextBtn.container, startBtn.container, closeBtn.container]);

    // Add all to main container
    this.dialogContainer.add([bg, portrait, nameText, dialogText, buttonsContainer]);

    // Store references
    this.dialogContainer.setData('dialogText', dialogText);
    this.dialogContainer.setData('nextBtn', nextBtn);
    this.dialogContainer.setData('startBtn', startBtn);
    this.dialogContainer.setData('closeBtn', closeBtn);

    // Entrance animation
    this.dialogContainer.setAlpha(0);
    this.dialogContainer.setScale(0.8);
    this.scene.tweens.add({
      targets: this.dialogContainer,
      alpha: 1,
      scaleX: 1,
      scaleY: 1,
      duration: 300,
      ease: 'Back.easeOut'
    });
  }

  private createButton(x: number, y: number, text: string, color: string, callback: () => void) {
    const container = this.scene.add.container(x, y);
    
    const bg = this.scene.add.rectangle(0, 0, 120, 35, parseInt(color.replace('#', '0x')));
    bg.setStrokeStyle(2, 0xffffff);
    
    const label = this.scene.add.text(0, 0, text, {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    container.add([bg, label]);
    
    // Make interactive
    bg.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.scene.tweens.add({
          targets: container,
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150,
          ease: 'Power2'
        });
      })
      .on('pointerout', () => {
        this.scene.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150,
          ease: 'Power2'
        });
      })
      .on('pointerdown', callback);

    return { container, bg, label };
  }

  private updateDialogContent(): void {
    if (!this.dialogContainer || !this.currentNPC) return;

    const dialogText = this.dialogContainer.getData('dialogText') as Phaser.GameObjects.Text;
    const nextBtn = this.dialogContainer.getData('nextBtn');
    const startBtn = this.dialogContainer.getData('startBtn');

    // Update text with typewriter effect
    dialogText.setText('');
    this.typewriterEffect(dialogText, this.currentNPC.dialogue[this.currentIndex]);

    // Update button visibility
    const isLastDialog = this.currentIndex >= this.currentNPC.dialogue.length - 1;
    nextBtn.container.setVisible(!isLastDialog);
    startBtn.container.setVisible(isLastDialog);
  }

  private typewriterEffect(textObj: Phaser.GameObjects.Text, fullText: string): void {
    let currentText = '';
    let index = 0;
    
    const timer = this.scene.time.addEvent({
      delay: 30,
      callback: () => {
        if (index < fullText.length) {
          currentText += fullText[index];
          textObj.setText(currentText);
          index++;
        } else {
          timer.destroy();
        }
      },
      loop: true
    });
  }

  private nextDialog(): void {
    if (!this.currentNPC) return;
    
    this.currentIndex++;
    if (this.currentIndex < this.currentNPC.dialogue.length) {
      this.updateDialogContent();
    }
  }

  private startScenario(): void {
    if (!this.currentNPC) return;
    
    if (this.onScenarioStart) {
      this.onScenarioStart(this.currentNPC.scenarioId);
    }
    this.closeDialog();
  }

  private setupKeyboardControls(): void {
    if (!this.scene.input.keyboard) return;

    this.keyboardControls = {
      enter: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER),
      esc: this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC)
    };

    // Set up key event listeners
    this.keyboardControls.enter.on('down', () => {
      if (this.isDialogActive) {
        const isLastDialog = this.currentIndex >= (this.currentNPC?.dialogue.length || 0) - 1;
        if (isLastDialog) {
          this.startScenario();
        } else {
          this.nextDialog();
        }
      }
    });

    this.keyboardControls.esc.on('down', () => {
      if (this.isDialogActive) {
        this.closeDialog();
      }
    });
  }

  private cleanupKeyboardControls(): void {
    if (this.keyboardControls) {
      this.keyboardControls.enter.removeAllListeners();
      this.keyboardControls.esc.removeAllListeners();
      this.keyboardControls = undefined;
    }
  }

  private closeDialog(): void {
    if (!this.dialogContainer) return;

    // Cleanup keyboard controls
    this.cleanupKeyboardControls();

    // Exit animation
    this.scene.tweens.add({
      targets: this.dialogContainer,
      alpha: 0,
      scaleX: 0.8,
      scaleY: 0.8,
      duration: 200,
      ease: 'Power2',
      onComplete: () => {
        this.dialogContainer?.destroy();
        this.dialogContainer = undefined;
        this.currentNPC = undefined;
        this.isDialogActive = false;
      }
    });
  }

  public isActive(): boolean {
    return this.isDialogActive;
  }
}