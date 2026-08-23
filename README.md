# 🏛️ ArchiSync UK | Architectural AI Real-time Interpreter & RIBA Minutes Suite

> **영국 건축설계 특화 초저지연 실시간 통역 & AI 스마트 회의록 시스템**
>
> UK Architectural Design & Construction Real-Time Voice Translation & Automated RIBA Minutes Generator

---

## 🌟 주요 핵심 기능

### 1. 영국 건축 실무 및 규제 기준 완벽 최적화
- **RIBA Plan of Work (Stage 0 ~ Stage 7)** 프로세스 의제 및 산출물 연동
- **영국 건축 고유 제도/법규 엔진**:
  - *Planning Permission (도시계획 개발 인허가)*
  - *Building Regulations (Part B 화재안전, Part L 에너지/단열, Part M 배리어프리)*
  - *Section 106 (공공기여 협약)*, *Party Wall Act (인접 대지 경계벽 법)*, *Snagging list (준공 전 결함 점검)*, *BOQ (공사 물량 산출서)*, *GIA / NIA (실면적/전용면적)*, *Ground Floor vs 1st Floor (영국 층수 표기)* 등
- **3,000+ 건축 전문 용어사전 (Glossary)** 내장 및 실시간 대화 중 용어 자동 감지 배지 노출

### 2. 초저지연 양방향 실시간 통역 (UK Native Speech & Translation)
- **영국 현지 억양 (London RP, Estuary, Scottish)** STT 음성 인식 및 영국 네이티브 액센트 TTS 음성 합성
- **스트리밍 실시간 통역 HUD (Streaming Translation HUD)**: 말하는 도중에 즉시 한국어 뜻을 상단 배너에 실시간 출력
- **실시간 오디오 파형 비주얼라이저**: Web Audio API 기반의 음파 애니메이션
- **도면 검토용 플로팅 자막 HUD (Drawing HUD)**: CAD 블루프린트 도면 위에서 실시간 자막 오버레이 확인
- **런던 건축가 실시간 회의 시뮬레이터**: Foster+Partners 출신 런던 건축가와의 실제 프로젝트 실시간 회의 시나리오 재생

### 3. RIBA 표준 건축 회의록 자동 생성 및 인쇄용 PDF 출력
- **구조화된 AI 회의록**:
  - 📌 **Key Decisions (합의 및 기술 결정사항)**
  - ⚡ **Action Items (담당자, 마감 기한, 상태 태그)**
  - ⚠️ **UK Regulatory Risks (Part L/B 및 인허가 리스크)**
  - 📐 **Drawings Referenced (도면 및 BIM 리비전 번호)**
  - ✍️ **Sign-off (영국 건축가 & 한국 총괄 소장 공식 서명란)**
- **전문가용 PDF 출력 (One-Click Print-Ready PDF)**: jsPDF 기반의 깔끔한 A4 인쇄 레이아웃 다운로드

---

## 🚀 빠른 시작 (Getting Started)

### 1. 패키지 설치
```bash
npm install
```

### 2. 개발 서버 실행
```bash
npm run dev
```

브라우저에서 `http://localhost:5173`으로 접속합니다.

### 3. 프로덕션 빌드
```bash
npm run build
```

---

## 🛠️ 기술 스택 (Tech Stack)
- **Frontend**: React 18, Vite 5, Tailwind CSS, Lucide Icons
- **AI & Translation**: Google Gemini 1.5/2.5 Flash, Hybrid Contextual Engine
- **Voice & Audio**: Web Speech API (en-GB, ko-KR), Web Audio API Visualizer
- **Export Engine**: jsPDF, jsPDF-AutoTable, Canvas Confetti