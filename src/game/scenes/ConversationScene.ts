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
    // Create dynamic background based on scenario
    const backgrounds = {
      'college-party': { color: 0x2a1810, overlay: 0x4a2820 },
      'travel-romance': { color: 0x1a2a3a, overlay: 0x2a4a6a },
      'relationship-milestone': { color: 0x2a1a2a, overlay: 0x4a3a4a },
      'dating-app': { color: 0x1a1a2a, overlay: 0x3a3a4a }
    };

    const bgData = backgrounds[this.conversationData.scenarioId as keyof typeof backgrounds] || backgrounds['college-party'];
    
    // Background gradient
    const bgRect = this.add.rectangle(400, 300, 800, 600, bgData.color);
    
    // Add atmospheric elements
    this.createAtmosphere();
    
    // Overlay for depth
    const overlay = this.add.rectangle(400, 300, 800, 600, bgData.overlay, 0.3);
  }

  private createAtmosphere(): void {
    // Add floating particles for atmosphere
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
      const particle = this.add.circle(
        Phaser.Math.Between(0, 800),
        Phaser.Math.Between(0, 600),
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
    // Player sprite (left side)
    this.playerSprite = this.add.sprite(150, 400, 'player-idle-0');
    this.playerSprite.setScale(3);
    this.playerSprite.setDepth(10);

    // NPC sprite (right side)  
    const npcKey = `npc-${this.conversationData.npcSprite}`;
    this.npcSprite = this.add.sprite(650, 400, npcKey);
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
    this.add.text(150, 480, 'You', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);

    this.add.text(650, 480, this.conversationData.npcName, {
      fontSize: '16px', 
      color: '#ffffff',
      backgroundColor: '#000000aa',
      padding: { x: 8, y: 4 }
    }).setOrigin(0.5);
  }

  private createDialogUI(): void {
    // Main dialog container
    this.dialogBox = this.add.container(400, 520);
    this.dialogBox.setDepth(100);

    // Dialog background with animated border
    const dialogBg = this.add.rectangle(0, 0, 750, 140, 0x000000, 0.9);
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
    this.npcNameText = this.add.text(-360, -50, this.conversationData.npcName, {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#4A90E2'
    });

    // Dialog text with typewriter effect
    this.dialogText = this.add.text(-360, -20, '', {
      fontSize: '16px',
      color: '#ffffff',
      wordWrap: { width: 700, useAdvancedWrap: true }
    });

    // Options container
    this.optionsContainer = this.add.container(0, 40);

    this.dialogBox.add([dialogBg, this.npcNameText, this.dialogText, this.optionsContainer]);

    // Animate dialog box entrance
    this.dialogBox.setAlpha(0);
    this.dialogBox.setY(600);
    this.tweens.add({
      targets: this.dialogBox,
      alpha: 1,
      y: 520,
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