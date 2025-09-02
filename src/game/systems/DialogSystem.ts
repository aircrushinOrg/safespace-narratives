import Phaser from 'phaser';

export class DialogSystem {
  private scene: Phaser.Scene;
  private dialogBox?: Phaser.GameObjects.Container;
  private currentDialogue: string[] = [];
  private currentIndex = 0;
  private currentNPC = '';
  private currentScenarioId = '';
  private scenarioCallback?: (scenarioId: string) => void;
  private isActive = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  public startDialog(npcName: string, dialogue: string[], scenarioId: string): void {
    if (this.isActive) return;

    this.currentNPC = npcName;
    this.currentDialogue = dialogue;
    this.currentScenarioId = scenarioId;
    this.currentIndex = 0;
    this.isActive = true;

    this.createDialogBox();
    this.updateDialogText();
  }

  private createDialogBox(): void {
    // Create dialog container
    this.dialogBox = this.scene.add.container(400, 500);
    this.dialogBox.setDepth(100);

    // Background
    const bg = this.scene.add.rectangle(0, 0, 760, 140, 0x000000, 0.9);
    bg.setStrokeStyle(3, 0xffffff, 1);
    
    // NPC Name
    const nameText = this.scene.add.text(-360, -50, this.currentNPC, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    });

    // Dialog text
    const dialogText = this.scene.add.text(-360, -20, '', {
      fontSize: '14px',
      color: '#ffffff',
      wordWrap: { width: 700, useAdvancedWrap: true }
    });

    // Next button
    const nextButton = this.scene.add.rectangle(250, 40, 100, 30, 0x4A90E2);
    nextButton.setStrokeStyle(2, 0xffffff);
    const nextText = this.scene.add.text(250, 40, 'Next', {
      fontSize: '14px',
      color: '#ffffff'
    });
    nextText.setOrigin(0.5);

    // Start Scenario button (initially hidden)
    const scenarioButton = this.scene.add.rectangle(100, 40, 140, 30, 0x28a745);
    scenarioButton.setStrokeStyle(2, 0xffffff);
    scenarioButton.setVisible(false);
    const scenarioText = this.scene.add.text(100, 40, 'Start Scenario', {
      fontSize: '14px',
      color: '#ffffff'
    });
    scenarioText.setOrigin(0.5);
    scenarioText.setVisible(false);

    // Close button
    const closeButton = this.scene.add.rectangle(350, 40, 80, 30, 0xdc3545);
    closeButton.setStrokeStyle(2, 0xffffff);
    const closeText = this.scene.add.text(350, 40, 'Close', {
      fontSize: '14px',
      color: '#ffffff'
    });
    closeText.setOrigin(0.5);

    // Add all elements to container
    this.dialogBox.add([
      bg, nameText, dialogText, nextButton, nextText, 
      scenarioButton, scenarioText, closeButton, closeText
    ]);

    // Set up interactivity
    nextButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.nextDialog());

    scenarioButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.startScenario());

    closeButton.setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.closeDialog());

    // Store references for easy access
    this.dialogBox.setData('dialogText', dialogText);
    this.dialogBox.setData('nextButton', nextButton);
    this.dialogBox.setData('nextText', nextText);
    this.dialogBox.setData('scenarioButton', scenarioButton);
    this.dialogBox.setData('scenarioText', scenarioText);
  }

  private updateDialogText(): void {
    if (!this.dialogBox) return;

    const dialogText = this.dialogBox.getData('dialogText') as Phaser.GameObjects.Text;
    const nextButton = this.dialogBox.getData('nextButton') as Phaser.GameObjects.Rectangle;
    const nextText = this.dialogBox.getData('nextText') as Phaser.GameObjects.Text;
    const scenarioButton = this.dialogBox.getData('scenarioButton') as Phaser.GameObjects.Rectangle;
    const scenarioText = this.dialogBox.getData('scenarioText') as Phaser.GameObjects.Text;

    dialogText.setText(this.currentDialogue[this.currentIndex]);

    // Show/hide buttons based on dialog progress
    const isLastDialog = this.currentIndex >= this.currentDialogue.length - 1;
    
    nextButton.setVisible(!isLastDialog);
    nextText.setVisible(!isLastDialog);
    scenarioButton.setVisible(isLastDialog);
    scenarioText.setVisible(isLastDialog);
  }

  private nextDialog(): void {
    this.currentIndex++;
    if (this.currentIndex < this.currentDialogue.length) {
      this.updateDialogText();
    }
  }

  private startScenario(): void {
    if (this.scenarioCallback) {
      this.scenarioCallback(this.currentScenarioId);
    }
    this.closeDialog();
  }

  private closeDialog(): void {
    if (this.dialogBox) {
      this.dialogBox.destroy();
      this.dialogBox = undefined;
    }
    this.isActive = false;
  }

  public setScenarioCallback(callback?: (scenarioId: string) => void): void {
    this.scenarioCallback = callback;
  }
}