import Phaser from 'phaser';

interface ConversationData {
  scenarioId: string;
  npcName: string;
  npcSprite: string;
  setting: string;
}

interface DialogOption {
  text: string;
  response: string;
  next?: DialogOption[];
  educational?: boolean;
}

export class ConversationScene extends Phaser.Scene {
  private npcSprite!: Phaser.GameObjects.Sprite;
  private playerSprite!: Phaser.GameObjects.Sprite;
  private dialogBox!: Phaser.GameObjects.Container;
  private dialogText!: Phaser.GameObjects.Text;
  private npcNameText!: Phaser.GameObjects.Text;
  private optionsContainer!: Phaser.GameObjects.Container;
  private currentOptions: DialogOption[] = [];
  private conversationData!: ConversationData;
  private scenarioCallback?: (scenarioId: string) => void;
  private typewriterEvent?: Phaser.Time.TimerEvent;

  constructor() {
    super({ key: 'ConversationScene' });
  }

  init(data: { conversationData: ConversationData; scenarioCallback?: (scenarioId: string) => void }) {
    this.conversationData = data.conversationData;
    this.scenarioCallback = data.scenarioCallback;
  }

  create(): void {
    this.createBackground();
    this.createCharacters();
    this.createDialogUI();
    this.startConversation();
    this.createBackButton();
  }

  private createBackground(): void {
    const { width, height } = this.sys.game.canvas;
    
    // Create detailed background based on scenario
    switch(this.conversationData.scenarioId) {
      case 'college-party':
        this.createPartyBackground(width, height);
        break;
      case 'travel-romance':
        this.createNightMarketBackground(width, height);
        break;
      case 'relationship-milestone':
        this.createHomeBackground(width, height);
        break;
      case 'dating-app':
        this.createCoffeeShopBackground(width, height);
        break;
      default:
        this.createDefaultBackground(width, height);
    }
    
    // Add atmospheric elements
    this.createAtmosphere();
  }

  private createPartyBackground(width: number, height: number): void {
    // Dark party room with colored lights
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x1a1a2e, 0x1a1a2e, 0x16213e, 0x0f3460);
    bg.fillRect(0, 0, width, height);
    
    // Party lights
    for (let i = 0; i < 6; i++) {
      const light = this.add.graphics();
      const colors = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0x96ceb4, 0xffeaa7];
      light.fillStyle(colors[i % colors.length], 0.3);
      light.fillCircle(
        (i / 5) * width, 
        height * 0.1, 
        30 + Math.random() * 20
      );
      
      this.tweens.add({
        targets: light,
        alpha: { from: 0.3, to: 0.7 },
        duration: 1000 + Math.random() * 1000,
        yoyo: true,
        repeat: -1
      });
    }
  }

  private createNightMarketBackground(width: number, height: number): void {
    // Night sky with lanterns
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c3e50, 0x2c3e50, 0x34495e, 0x34495e);
    bg.fillRect(0, 0, width, height);
    
    // Food stall lights
    for (let i = 0; i < 4; i++) {
      const lantern = this.add.graphics();
      lantern.fillStyle(0xf39c12, 0.6);
      lantern.fillRect((i / 3) * width - 20, height * 0.2, 40, 60);
      lantern.fillStyle(0xe74c3c, 0.4);
      lantern.fillRect((i / 3) * width - 15, height * 0.25, 30, 50);
    }
  }

  private createHomeBackground(width: number, height: number): void {
    // Warm cozy room
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x8b4513, 0x8b4513, 0x654321, 0x654321);
    bg.fillRect(0, 0, width, height);
    
    // Warm lamp light
    const lampLight = this.add.graphics();
    lampLight.fillGradientStyle(0xffd700, 0xffd700, 0x8b4513, 0x8b4513, 0.5);
    lampLight.fillCircle(width * 0.8, height * 0.3, 100);
  }

  private createCoffeeShopBackground(width: number, height: number): void {
    // Coffee shop ambiance
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x6f4e37, 0x6f4e37, 0x8b7355, 0x8b7355);
    bg.fillRect(0, 0, width, height);
    
    // Coffee steam effect
    for (let i = 0; i < 3; i++) {
      const steam = this.add.graphics();
      steam.fillStyle(0xffffff, 0.1);
      steam.fillCircle(width * 0.2 + i * 10, height * 0.6, 5);
      
      this.tweens.add({
        targets: steam,
        y: height * 0.3,
        alpha: 0,
        duration: 2000,
        repeat: -1,
        delay: i * 500
      });
    }
  }

  private createDefaultBackground(width: number, height: number): void {
    const bg = this.add.graphics();
    bg.fillGradientStyle(0x2c5530, 0x2c5530, 0x1a3d1f, 0x1a3d1f);
    bg.fillRect(0, 0, width, height);
  }

  private createAtmosphere(): void {
    const { width, height } = this.sys.game.canvas;
    
    // Add floating particles for atmosphere
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 3),
        0xffffff,
        0.1
      );
      
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-50, 50),
        y: particle.y + Phaser.Math.Between(-50, 50),
        alpha: { from: 0.05, to: 0.2 },
        duration: Phaser.Math.Between(3000, 6000),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  private createCharacters(): void {
    const { width, height } = this.sys.game.canvas;
    
    // Player sprite (left side)
    this.playerSprite = this.add.sprite(width * 0.19, height * 0.67, 'player-idle-0');
    this.playerSprite.setScale(3);
    this.playerSprite.setDepth(10);

    // NPC sprite (right side)  
    const npcKey = `npc-${this.conversationData.npcSprite}`;
    this.npcSprite = this.add.sprite(width * 0.81, height * 0.67, npcKey);
    this.npcSprite.setScale(3);
    this.npcSprite.setDepth(10);

    // Add breathing animation to characters
    this.tweens.add({
      targets: [this.playerSprite, this.npcSprite],
      scaleX: '+=0.05',
      scaleY: '+=0.1',
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Add name labels
    this.add.text(this.playerSprite.x, this.playerSprite.y + 60, 'You', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    this.add.text(this.npcSprite.x, this.npcSprite.y + 60, this.conversationData.npcName, {
      fontSize: '16px', 
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
  }

  private createDialogUI(): void {
    const { width, height } = this.sys.game.canvas;
    
    // Main dialog container positioned at bottom
    this.dialogBox = this.add.container(width / 2, height * 0.87);
    this.dialogBox.setDepth(100);

    // Dialog background with animated border - sized for screen
    const dialogWidth = Math.min(width * 0.9, 750);
    const dialogBg = this.add.rectangle(0, 0, dialogWidth, 140, 0x000000, 0.9);
    dialogBg.setStrokeStyle(3, 0x4A90E2, 1);
    
    // Add subtle glow animation to border
    this.tweens.add({
      targets: dialogBg,
      alpha: 0.7,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // NPC name display
    this.npcNameText = this.add.text(-dialogWidth / 2 + 20, -50, this.conversationData.npcName, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#4A90E2'
    });

    // Dialog text with typewriter effect
    this.dialogText = this.add.text(-dialogWidth / 2 + 20, -20, '', {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: dialogWidth - 40, useAdvancedWrap: true }
    });

    // Options container
    this.optionsContainer = this.add.container(0, 40);

    this.dialogBox.add([dialogBg, this.npcNameText, this.dialogText, this.optionsContainer]);

    // Animate dialog box entrance
    this.dialogBox.setAlpha(0);
    this.dialogBox.setY(height);
    this.tweens.add({
      targets: this.dialogBox,
      alpha: 1,
      y: height * 0.87,
      duration: 500,
      ease: 'Back.easeOut'
    });
  }

  private createBackButton(): void {
    const backBtn = this.add.rectangle(50, 50, 80, 35, 0x333333, 0.8);
    backBtn.setStrokeStyle(2, 0xffffff);
    const backText = this.add.text(50, 50, 'Back', {
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    backBtn.setInteractive({ useHandCursor: true })
      .on('pointerover', () => {
        this.tweens.add({
          targets: [backBtn, backText],
          scaleX: 1.1,
          scaleY: 1.1,
          duration: 150
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: [backBtn, backText],
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
      })
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      });
  }

  private startConversation(): void {
    const scenarios = this.getScenarioDialogs();
    const scenario = scenarios[this.conversationData.scenarioId as keyof typeof scenarios];
    
    if (scenario) {
      this.showDialog(scenario.intro, scenario.options);
    }
  }

  private getScenarioDialogs() {
    return {
      'college-party': {
        intro: "Hey! I think we have biology class together? This party is crazy! *takes a sip* Want to grab some fresh air and chat?",
        options: [
          {
            text: "Sure, let's get some air. How long have you been at this party?",
            response: "About an hour! I love how direct you are. Most people just small talk. Want to find somewhere quieter?",
            next: [
              {
                text: "I want to make sure we're both safe and comfortable.",
                response: "Wow, you're really responsible. I like that about you. What did you have in mind?",
                educational: true
              },
              {
                text: "Let's discuss protection and what we're comfortable with.",
                response: "That's very mature of you. I appreciate someone who thinks ahead.",
                educational: true
              }
            ]
          },
          {
            text: "Are you feeling okay? You seem a bit tipsy.",
            response: "Tipsy? *laughs* Maybe a little! But I'm having so much fun. You worry too much!",
            next: [
              {
                text: "Maybe we should slow down and get to know each other better first.",
                response: "You're right... I guess I was getting carried away. Want to just talk?",
                educational: true
              }
            ]
          }
        ]
      },
      'travel-romance': {
        intro: "You look lost! *laughs warmly* I'm Jamie - been backpacking for months. This is my favorite food stall. Want me to help you order?",
        options: [
          {
            text: "That's so kind! I'd love to try authentic food here.",
            response: "Great! *orders food* So what brings you to Thailand? First time traveling solo?"
          },
          {
            text: "Thanks! I'm curious - how do you stay healthy while traveling?", 
            response: "Smart question! I just go with the flow mostly. Life's about experiences, right?",
            educational: true
          }
        ]
      },
      'relationship-milestone': {
        intro: "I love how comfortable we've become. *sits closer* Maybe it's time we talked about taking our intimacy to the next level?",
        options: [
          {
            text: "I've been thinking the same thing. Should we talk about testing first?",
            response: "Testing? I appreciate that you brought it up. When did you last get tested?",
            educational: true
          },
          {
            text: "I love you too. Let's make sure we're both comfortable and safe.",
            response: "Thank you for thinking about both of us. I love how we communicate.",
            educational: true
          }
        ]
      },
      'dating-app': {
        intro: "You're even cuter in person! *grins* Our conversations have been amazing. Want to head somewhere more private?",
        options: [
          {
            text: "Thank you! I've really enjoyed our conversations too.",
            response: "I'm glad! I felt this connection right away. What do you think about going back to my place?"
          },
          {
            text: "I'm interested, but maybe we should discuss safety and protection first?",
            response: "Safety first - I respect that! I always carry protection and get tested regularly.",
            educational: true
          }
        ]
      }
    };
  }

  private showDialog(text: string, options: DialogOption[]): void {
    // Clear previous content
    this.dialogText.setText('');
    this.optionsContainer.removeAll(true);
    
    // Typewriter effect for dialog
    this.typewriterText(text);
    
    // Store options for later display
    this.currentOptions = options;
    
    // Show options after text is done
    this.time.delayedCall(text.length * 30 + 500, () => {
      this.showOptions();
    });
  }

  private typewriterText(text: string): void {
    let index = 0;
    this.typewriterEvent = this.time.addEvent({
      delay: 30,
      callback: () => {
        if (index < text.length) {
          this.dialogText.setText(text.substring(0, index + 1));
          index++;
        } else {
          this.typewriterEvent?.destroy();
        }
      },
      repeat: text.length
    });
  }

  private showOptions(): void {
    this.currentOptions.forEach((option, index) => {
      const optionBtn = this.createOptionButton(
        -250 + (index * 250),
        0,
        option.text,
        option.educational || false
      );
      
      optionBtn.on('pointerdown', () => {
        this.handleOptionSelect(option);
      });
      
      this.optionsContainer.add(optionBtn);
      
      // Animate option appearance
      optionBtn.setAlpha(0);
      optionBtn.setScale(0.8);
      this.tweens.add({
        targets: optionBtn,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 300,
        delay: index * 100,
        ease: 'Back.easeOut'
      });
    });
  }

  private createOptionButton(x: number, y: number, text: string, educational: boolean): Phaser.GameObjects.Container {
    const container = this.add.container(x, y);
    
    const buttonColor = educational ? 0x28a745 : 0x4A90E2;
    const bg = this.add.rectangle(0, 0, 200, 50, buttonColor, 0.8);
    bg.setStrokeStyle(2, 0xffffff);
    
    const buttonText = this.add.text(0, 0, text, {
      fontSize: '12px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 180 }
    }).setOrigin(0.5);
    
    // Add educational icon
    if (educational) {
      const icon = this.add.text(-85, -20, '💡', { fontSize: '16px' });
      container.add(icon);
    }
    
    container.add([bg, buttonText]);
    
    // Interactive effects
    container.setInteractive(new Phaser.Geom.Rectangle(-100, -25, 200, 50), Phaser.Geom.Rectangle.Contains)
      .on('pointerover', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1.05,
          scaleY: 1.05,
          duration: 150
        });
      })
      .on('pointerout', () => {
        this.tweens.add({
          targets: container,
          scaleX: 1,
          scaleY: 1,
          duration: 150
        });
      });
    
    return container;
  }

  private handleOptionSelect(option: DialogOption): void {
    // Player choice animation
    this.tweens.add({
      targets: this.playerSprite,
      scaleX: 3.2,
      scaleY: 3.2,
      duration: 200,
      yoyo: true
    });

    // Clear options
    this.optionsContainer.removeAll(true);
    
    // Show NPC response
    this.time.delayedCall(500, () => {
      // NPC response animation
      this.tweens.add({
        targets: this.npcSprite,
        scaleX: 3.2,
        scaleY: 3.2,
        duration: 200,
        yoyo: true
      });
      
      if (option.next && option.next.length > 0) {
        this.showDialog(option.response, option.next);
      } else {
        // End conversation with educational summary
        this.showDialog(option.response + "\n\n💡 Great conversation! Remember: Communication and safety first!", []);
        
        this.time.delayedCall(3000, () => {
          this.scene.start('GameScene');
        });
      }
      
      // Show educational prompt if applicable
      if (option.educational) {
        this.showEducationalPrompt();
      }
    });
  }

  private showEducationalPrompt(): void {
    const prompt = this.add.container(400, 150);
    prompt.setDepth(200);
    
    const promptBg = this.add.rectangle(0, 0, 400, 100, 0x28a745, 0.9);
    promptBg.setStrokeStyle(2, 0xffffff);
    
    const promptText = this.add.text(0, 0, '💡 Great choice! You prioritized safety and communication.', {
      fontSize: '14px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 350 }
    }).setOrigin(0.5);
    
    prompt.add([promptBg, promptText]);
    
    // Animate prompt
    prompt.setAlpha(0);
    this.tweens.add({
      targets: prompt,
      alpha: 1,
      duration: 300,
      yoyo: true,
      delay: 2000
    });
  }
}