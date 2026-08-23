const STORAGE_KEYS = {
  MEETINGS: 'meetflow_meetings_v1',
  CURRENT_MEETING: 'meetflow_current_meeting_v1',
  CUSTOM_DICT: 'meetflow_custom_dict_v1',
  API_SETTINGS: 'meetflow_api_settings_v1',
  LICENSE: 'meetflow_license_v1',
  THEME: 'meetflow_theme_v1'
};

export const storageService = {
  getMeetings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEETINGS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveMeeting: (meeting) => {
    try {
      const meetings = storageService.getMeetings();
      const existingIdx = meetings.findIndex(m => m.id === meeting.id);
      if (existingIdx >= 0) {
        meetings[existingIdx] = meeting;
      } else {
        meetings.unshift(meeting);
      }
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings.slice(0, 30)));
      return true;
    } catch {
      return false;
    }
  },

  deleteMeeting: (meetingId) => {
    try {
      const meetings = storageService.getMeetings().filter(m => m.id !== meetingId);
      localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
      return true;
    } catch {
      return false;
    }
  },

  getCustomDict: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_DICT);
      return data ? JSON.parse(data) : [
        { term: 'A프로젝트', definition: '2026 하반기 전사 차세대 코어뱅킹 플랫폼 전환 프로젝트', category: '사내프로젝트', phonetics: ['에이프로젝트', 'A플젝'] },
        { term: '김팀장 (김개발)', definition: '플랫폼 테크 리드', category: '임직원', phonetics: ['김팀장', '김개발팀장'] },
        { term: '위클리 싱크', definition: '매주 월요일 진행하는 핵심 리더십 주간 업무 조율 회의', category: '사내문화', phonetics: ['위클리', '싱크미팅'] }
      ];
    } catch {
      return [];
    }
  },

  saveCustomDict: (dict) => {
    try {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_DICT, JSON.stringify(dict));
      return true;
    } catch {
      return false;
    }
  },

  getApiSettings: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.API_SETTINGS);
      return data ? JSON.parse(data) : {
        provider: 'gemini', // 'gemini' | 'openai' | 'offline'
        geminiApiKey: '',
        openaiApiKey: '',
        model: 'gemini-1.5-flash',
        useLocalEngine: true
      };
    } catch {
      return { provider: 'offline', useLocalEngine: true };
    }
  },

  saveApiSettings: (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.API_SETTINGS, JSON.stringify(settings));
      return true;
    } catch {
      return false;
    }
  },

  getLicense: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LICENSE);
      return data ? JSON.parse(data) : { plan: 'PRO', status: 'active', key: 'MEETFLOW-ENTERPRISE-UNLIMITED', expiresAt: '2027-12-31' };
    } catch {
      return { plan: 'PRO', status: 'active', key: 'MEETFLOW-ENTERPRISE-UNLIMITED' };
    }
  },

  saveLicense: (lic) => {
    try {
      localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(lic));
      return true;
    } catch {
      return false;
    }
  }
};
