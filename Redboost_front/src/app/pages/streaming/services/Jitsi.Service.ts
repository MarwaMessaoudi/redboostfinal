import { Injectable } from '@angular/core';
declare var JitsiMeetExternalAPI: any;

@Injectable({
  providedIn: 'root'
})
export class JitsiService {
  private domain = 'localhost';

  constructor() { }

  async loadJitsiScript(): Promise<void> {
    if (typeof JitsiMeetExternalAPI !== 'undefined') {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'http://localhost:8000/external_api.js'; // Assurez-vous que c’est HTTP sur 8000
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (error) => {
        console.error('Erreur lors du chargement du script Jitsi:', error);
        reject(error);
      };
      document.body.appendChild(script);
    });
  }

  async createMeeting(roomName: string): Promise<any> {
    await this.loadJitsiScript(); // Assure que le script est chargé avant de continuer
    const container = document.getElementById('jitsi-container');
    if (!container) {
      console.error('Conteneur Jitsi non trouvé');
      return null;
    }

    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: container,
      lang: 'fr',
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: true,
        prejoinPageEnabled: true,
        enableWelcomePage: false,
        disableDeepLinking: true,
        disableInitialGUM: false,
        enableClosePage: false,
        disable1On1Mode: true,
        disableModeratorIndicator: true,
        enableLobbyChat: false,
        hideLobbyButton: true,
        requireDisplayName: false
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_REMOTE_DISPLAY_NAME: 'Participant',
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'chat', 'recording',
          'settings', 'raisehand', 'videoquality', 'filmstrip'
        ]
      }
    };

    try {
      return new JitsiMeetExternalAPI(this.domain, options);
    } catch (error) {
      console.error('Erreur lors de la création de la réunion:', error);
      return null;
    }
  }
}