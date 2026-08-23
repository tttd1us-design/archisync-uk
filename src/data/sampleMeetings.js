export const SAMPLE_MEETINGS = [
  {
    id: 'it-sprint-demo',
    industryId: 'it',
    title: 'Q3 결제 시스템 마이크로서비스 전환 및 기술 부채 해소 스프린트 회의',
    date: '2026-08-23 10:00',
    duration: '28분 15초',
    audioName: 'IT_Sprint_Planning_Microservice_Q3.wav',
    speakers: [
      { id: 'spk-1', name: '김개발 (Tech Lead)', role: '진행 / 아키텍처', color: 'bg-indigo-600' },
      { id: 'spk-2', name: '이프론트 (FE Lead)', role: '프론트엔드', color: 'bg-cyan-600' },
      { id: 'spk-3', name: '박백엔드 (BE Senior)', role: '백엔드/인프라', color: 'bg-emerald-600' },
      { id: 'spk-4', name: '최기획 (Product Owner)', role: '기획 / 일정', color: 'bg-amber-600' }
    ],
    transcript: [
      {
        id: 't-1',
        speakerId: 'spk-1',
        speakerName: '김개발 (Tech Lead)',
        time: '00:15',
        text: '모두 참석하셨죠. 오늘 회의 어젠다는 세 가지입니다. 첫째, 모놀리식 결제 모듈의 MSA 분리 진행상황, 둘째 이번 스프린트에서 해결할 결제 지연 Tech Debt 리팩토링, 셋째 다음 주 수요일 예정된 K8s 클러스터 무중단 배포 계획입니다.'
      },
      {
        id: 't-2',
        speakerId: 'spk-4',
        speakerName: '최기획 (Product Owner)',
        time: '01:05',
        text: '다음 달 추석 프로모션 트래픽이 평소 대비 400% 몰릴 것으로 예상됩니다. 지난번 발생한 PG사 연동 타임아웃 오류 핫픽스 건은 이번 마이크로서비스 전환에서 완벽하게 해소되어야 합니다.'
      },
      {
        id: 't-3',
        speakerId: 'spk-3',
        speakerName: '박백엔드 (BE Senior)',
        time: '02:40',
        text: '네, 카프카(Kafka) 기반의 비동기 결제 이벤트 큐를 이미 구축해 두었습니다. DB 커넥션 풀링 부하를 70% 줄였고, 내일 오후까지 결제 승인 마이크로서비스의 PR(Pull Request)을 올리겠습니다. CI/CD 파이프라인 자동 테스트 통과하면 바로 스테이징에 배포하겠습니다.'
      },
      {
        id: 't-4',
        speakerId: 'spk-2',
        speakerName: '이프론트 (FE Lead)',
        time: '04:20',
        text: '프론트엔드 쪽은 GraphQL 쿼리 캐싱 적용해서 결제창 렌더링 속도를 1.8초에서 0.4초로 단축했습니다. 다만 백엔드에서 내려주는 새 결제 에러 코드 명세서가 확정되어야 예외처리 UI 작업을 마무리할 수 있습니다.'
      },
      {
        id: 't-5',
        speakerId: 'spk-1',
        speakerName: '김개발 (Tech Lead)',
        time: '05:50',
        text: '좋습니다. 액션아이템 정리하겠습니다. 박백엔드님은 내일 18시까지 결제 MSA PR 올리고 에러코드 API 명세를 슬랙과 노션에 공유해 주세요. 이프론트님은 목요일까지 에러 UI 컴포넌트 구현 완료하고, 최기획님은 이번 주 금요일 14시에 QA 팀과 결제 시나리오 통합 테스트 일정 잡아주세요.'
      },
      {
        id: 't-6',
        speakerId: 'spk-4',
        speakerName: '최기획 (Product Owner)',
        time: '07:10',
        text: '네, 금요일 14시 QA 미팅 캘린더 초대 발송하겠습니다. 지라(Jira) 티켓도 백로그에 생성해 두겠습니다.'
      }
    ]
  },
  {
    id: 'finance-q3-demo',
    industryId: 'finance',
    title: '2026 하반기 신규 핀테크 펀드 포트폴리오 밸류에이션 및 리스크 점검',
    date: '2026-08-23 11:30',
    duration: '35분 40초',
    audioName: 'Finance_Valuation_Risk_Review.wav',
    speakers: [
      { id: 'spk-11', name: '정이사 (Head of Fund)', role: '투자심사 총괄', color: 'bg-emerald-600' },
      { id: 'spk-12', name: '강수석 (Lead Analyst)', role: '기업 밸류에이션', color: 'bg-blue-600' },
      { id: 'spk-13', name: '윤매니저 (Risk Mgr)', role: '리스크 관리/컴플라이언스', color: 'bg-rose-600' },
      { id: 'spk-14', name: '한대리 (Quant/Ops)', role: '퀀트 운용/리포팅', color: 'bg-violet-600' }
    ],
    transcript: [
      {
        id: 'tf-1',
        speakerId: 'spk-11',
        speakerName: '정이사 (Head of Fund)',
        time: '00:20',
        text: '이번 주 금융위 DSR 규제 강화 가이드라인 발표에 따라, 우리가 투자 검토 중인 핀테크 B2C 대출 중개 플랫폼의 밸류에이션과 EBITDA 멀티플을 전면 재산정해야 합니다.'
      },
      {
        id: 'tf-2',
        speakerId: 'spk-12',
        speakerName: '강수석 (Lead Analyst)',
        time: '01:50',
        text: '해당 기업의 작년 EBITDA는 45억 원이며, 동종 상장사 PER 및 PBR 배수를 감안했을 때 당초 800억 밸류를 제시했으나, 규제로 인한 여신 취급액 감소분을 반영하면 적정 밸류는 620억~650억 수준으로 조정하는 것이 타당합니다.'
      },
      {
        id: 'tf-3',
        speakerId: 'spk-13',
        speakerName: '윤매니저 (Risk Mgr)',
        time: '03:30',
        text: '컴플라이언스 이슈도 있습니다. AML 및 KYC 자동 심사 시스템이 금융보안원 보안 가이드를 완벽히 통과했는지 여신심사 언더라이팅 감사 보고서를 이번 주 내로 전달받기로 했습니다.'
      },
      {
        id: 'tf-4',
        speakerId: 'spk-11',
        speakerName: '정이사 (Head of Fund)',
        time: '05:10',
        text: '결론 내립니다. 강수석님은 630억 기준의 수정 DCF 모델링 보고서를 수요일 투심위 전까지 작성해 주시고, 윤매니저님은 금요일까지 감사보고서 법률 검토 완료해 주세요. 한대리님은 투자조합 LP 대상 분기 리포트에 이번 리밸런싱 개요를 반영해 주시기 바랍니다.'
      }
    ]
  },
  {
    id: 'manufacturing-scm-demo',
    industryId: 'manufacturing',
    title: '전기차 배터리 모듈 라인 수율 저하 긴급 대책 및 공급망(SCM) 회의',
    date: '2026-08-23 14:00',
    duration: '22분 10초',
    audioName: 'Manufacturing_SCM_Yield_Emergency.wav',
    speakers: [
      { id: 'spk-21', name: '조공장장 (Plant Director)', role: '총괄 책임자', color: 'bg-amber-600' },
      { id: 'spk-22', name: '오생기 (Production Eng)', role: '생산기술팀장', color: 'bg-blue-600' },
      { id: 'spk-23', name: '민품질 (QC Lead)', role: '품질보증', color: 'bg-red-600' },
      { id: 'spk-24', name: '송구매 (SCM Manager)', role: '구매/SCM', color: 'bg-teal-600' }
    ],
    transcript: [
      {
        id: 'tm-1',
        speakerId: 'spk-21',
        speakerName: '조공장장 (Plant Director)',
        time: '00:10',
        text: '오늘 2공장 3라인 배터리 팩 조립 수율이 91.2%로 떨어져 기준 목표인 98%에 크게 미달했습니다. 원인 파악 및 SCM 긴급 대책을 논의합시다.'
      },
      {
        id: 'tm-2',
        speakerId: 'spk-23',
        speakerName: '민품질 (QC Lead)',
        time: '01:15',
        text: '불량 분석 결과, 신규 알루미늄 하우징 사출 금형의 열 변형으로 인한 결합 유격이 발생했습니다. PPM 단위 불량률이 3,200까지 치솟아 즉시 해당 로트 전량 출하 중단 조치했습니다.'
      },
      {
        id: 'tm-3',
        speakerId: 'spk-24',
        speakerName: '송구매 (SCM Manager)',
        time: '02:45',
        text: '기존 1차 벤더사 OEM 금형 보수에는 4일이 소요됩니다. 고객사 완성차 라인 셧다운을 방지하기 위해 2차 협력사의 안전재고 5,000세트를 긴급 수송 투입하겠습니다. 리드타임은 내일 오전 8시입니다.'
      },
      {
        id: 'tm-4',
        speakerId: 'spk-22',
        speakerName: '오생기 (Production Eng)',
        time: '04:00',
        text: '생산기술팀에서는 야간에 설비보전(TPM) 긴급 점검을 실시하고 레이저 용접 파라미터를 보정하여 내일 오전 9시 시험가동을 재개하겠습니다.'
      },
      {
        id: 'tm-5',
        speakerId: 'spk-21',
        speakerName: '조공장장 (Plant Director)',
        time: '05:30',
        text: '조치 좋습니다. 송구매님은 내일 아침 8시 안전재고 입고 확인 즉시 보고하시고, 민품질님은 양품 검사 후 전수검사 성적서를 11시까지 완성차 고객사에 송부하세요. 오생기팀장은 내일 14시 수율 복구 현황을 임원진에 보고 바랍니다.'
      }
    ]
  },
  {
    id: 'marketing-growth-demo',
    industryId: 'marketing',
    title: '글로벌 D2C 뷰티 브랜드 Q4 블랙프라이데이 퍼널 최적화 및 ROAS 극대화 전략',
    date: '2026-08-23 16:20',
    duration: '24분 50초',
    audioName: 'Marketing_Funnel_ROAS_Q4.wav',
    speakers: [
      { id: 'spk-31', name: '백그로스 (Growth Lead)', role: '마케팅 총괄', color: 'bg-rose-600' },
      { id: 'spk-32', name: '신퍼포먼스 (Performance Mkt)', role: '광고운영 / 소재', color: 'bg-purple-600' },
      { id: 'spk-33', name: '유콘텐츠 (Creative Dir)', role: '디자인 / 랜딩페이지', color: 'bg-pink-600' },
      { id: 'spk-34', name: '차CRM (CRM Specialist)', role: 'CRM / 리텐션', color: 'bg-orange-600' }
    ],
    transcript: [
      {
        id: 'tg-1',
        speakerId: 'spk-31',
        speakerName: '백그로스 (Growth Lead)',
        time: '00:15',
        text: '북미 블프 시즌 대비 타깃 ROAS를 450%로 설정했습니다. 현재 메타/틱톡 광고 CAC가 전월비 18% 상승한 상태라, 퍼널 유입 단가 최적화와 결제 전환율(CVR) 개선이 시급합니다.'
      },
      {
        id: 'tg-2',
        speakerId: 'spk-32',
        speakerName: '신퍼포먼스 (Performance Mkt)',
        time: '01:40',
        text: '숏폼 영상 소재 12종에 대해 A/B 테스팅을 진행했는데, 언박싱 리뷰 영상의 CTR이 4.2%로 가장 높고 CPC는 $0.32로 가장 저렴합니다. 이 위닝 소재로 예산 60%를 집중 배분하겠습니다.'
      },
      {
        id: 'tg-3',
        speakerId: 'spk-34',
        speakerName: '차CRM (CRM Specialist)',
        time: '03:10',
        text: '기존 구매 고객 대상 카카오 알림톡 및 해외 이메일 시퀀스 자동화 세팅했습니다. 장바구니 이탈 고객에게 2시간 내 15% 쿠폰을 발송하는 트리거를 걸면 LTV가 약 22% 상승할 것으로 분석됩니다.'
      },
      {
        id: 'tg-4',
        speakerId: 'spk-31',
        speakerName: '백그로스 (Growth Lead)',
        time: '04:45',
        text: '실행 계획 확정합니다. 신퍼포먼스님은 내일 오전까지 메타 예산 리로케이션 완료하고, 유콘텐츠님은 목요일까지 모바일 결제 간소화 랜딩페이지 3종 퍼블리싱 마쳐주세요. 차CRM님은 금요일까지 VIP 고객 선구매 전용 이메일 발송 예약 걸어두세요.'
      }
    ]
  }
];
