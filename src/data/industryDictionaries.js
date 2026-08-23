export const INDUSTRY_DICTIONARIES = {
  it: {
    id: 'it',
    name: 'IT / 테크 / 스타트업',
    icon: 'Code2',
    color: 'from-blue-500 to-indigo-600',
    description: '애자일 스프린트, 클라우드 아키텍처, 개발/배포 및 프로덕트 용어 최적화',
    terms: [
      { term: 'Sprint (스프린트)', definition: '애자일 개발에서 보통 1~3주 단위로 목표를 완수하는 반복 주기', category: 'Agile', phonetics: ['스프린트', '스프린터', '스프링트'] },
      { term: 'PR (Pull Request)', definition: '코드 변경 사항을 메인 브랜치에 병합하기 전 동료 리뷰를 요청하는 프로세스', category: 'Dev', phonetics: ['피알', '풀리퀘', '풀리퀘스트', 'PR'] },
      { term: 'CI/CD', definition: '지속적 통합(CI) 및 지속적 배포(CD) 파이프라인 자동화', category: 'DevOps', phonetics: ['씨아이씨디', '씨아이', '씨디', '파이프라인'] },
      { term: 'K8s (Kubernetes)', definition: '컨테이너화된 애플리케이션의 자동 배포, 스케일링을 관리하는 오픈소스 시스템', category: 'Cloud', phonetics: ['쿠버네티스', '쿠베', '케이팔에스', '케이에이츠'] },
      { term: 'Tech Debt (기술 부채)', definition: '빠른 출시를 위해 선택한 임시방편 코드가 향후 유지보수에 초래하는 추가 비용', category: 'Architecture', phonetics: ['기술부채', '텍뎁', '테크뎁트'] },
      { term: 'Refactoring (리팩토링)', definition: '소프트웨어의 겉보기 동작은 바꾸지 않고 내부 구조를 개선하여 가독성과 성능을 높이는 작업', category: 'Dev', phonetics: ['리팩토링', '리팩토어링', '리팩터링'] },
      { term: 'Backlog (백로그)', definition: '프로덕트에서 개발 또는 개선해야 할 요구사항 및 기능의 우선순위 목록', category: 'Product', phonetics: ['백로그', '백록', '프로덕트백로그'] },
      { term: 'Retro (회고 / Retrospective)', definition: '스프린트 종료 후 잘된 점(KPT)과 개선할 점을 점검하는 팀 미팅', category: 'Agile', phonetics: ['회고', '레트로', '레트로스펙티브'] },
      { term: 'Microservices (MSA)', definition: '애플리케이션을 작고 독립적으로 배포 가능한 서비스들의 조합으로 구축하는 아키텍처', category: 'Architecture', phonetics: ['엠에스에이', '마이크로서비스', '마이크로 아키텍처'] },
      { term: 'Kafka (카프카)', definition: '대용량 실시간 이벤트 데이터 스트리밍 분산 플랫폼', category: 'Data/Infra', phonetics: ['카프카', '아파치카프카'] },
      { term: 'GraphQL', definition: '클라이언트가 필요한 데이터 구조를 정확히 쿼리할 수 있게 해주는 API 쿼리 언어', category: 'API', phonetics: ['그래프큐엘', '지큐엘'] },
      { term: 'Hotfix (핫픽스)', definition: '운영 중인 서비스에서 긴급하게 발생한 버그를 즉시 패치하여 배포하는 작업', category: 'DevOps', phonetics: ['핫픽스', '긴급패치', '핫패치'] }
    ]
  },
  finance: {
    id: 'finance',
    name: '금융 / 핀테크 / 투자',
    icon: 'TrendingUp',
    color: 'from-emerald-500 to-teal-600',
    description: '여신/수신, 재무비율, IPO, 펀드 밸류에이션 및 규제 컴플라이언스 용어 최적화',
    terms: [
      { term: 'DSR (총부채원리금상환비율)', definition: '연간 총소득 대비 전체 금융부채의 연간 원리금 상환액 비율 (대출 규제 지표)', category: 'Regulatory', phonetics: ['디에스알', '총부채원리금상환비율', 'DSR'] },
      { term: 'LTV (주택담보대출비율)', definition: '담보 부동산의 평가 가치 대비 대출 가능 금액의 비율', category: 'Loan', phonetics: ['엘티브이', '담보비율', 'LTV'] },
      { term: 'EBITDA', definition: '이자, 세금, 감가상각비 차감 전 영업이익으로 기업의 실질 현금창출능력을 평가하는 지표', category: 'Valuation', phonetics: ['에비타', '이비따', '이비트다', 'EBITDA'] },
      { term: 'IPO (기업공개)', definition: '기업이 최초로 외부 투자자에게 주식을 공개 매도하고 증시에 상장하는 절차', category: 'Investment', phonetics: ['아이피오', '기업공개', '상장'] },
      { term: 'Valuation (밸류에이션)', definition: '기업이나 자산의 현재 적정 가치를 산정하는 과정 (DCF, 멀티플 등)', category: 'Valuation', phonetics: ['밸류에이션', '기업가치', '밸류'] },
      { term: 'Liquidity (유동성)', definition: '자산을 손실 없이 빠르게 현금으로 전환할 수 있는 정도', category: 'Market', phonetics: ['유동성', '리퀴디티', '현금성'] },
      { term: 'Short Selling (공매도)', definition: '주가 하락이 예상될 때 주식을 빌려서 매도한 후 주가가 떨어지면 사서 갚는 투자 기법', category: 'Trading', phonetics: ['공매도', '숏셀링', '숏포지션'] },
      { term: 'AML / KYC', definition: '자금세탁방지(AML) 및 고객확인의무(KYC) 금융 규제 준수 프로세스', category: 'Compliance', phonetics: ['에이엠엘', '케이와이씨', '고객인증'] },
      { term: 'PBR / PER', definition: '주가순자산비율(PBR) 및 주가수익비율(PER) 등 대표적인 주가 평가지표', category: 'Indicator', phonetics: ['피비알', '피이알', '주가배수'] },
      { term: 'Underwriting (인수/심사)', definition: '대출이나 보험 계약 시 금융사가 차주의 신용도와 위험을 정밀 심사하여 인수 여부를 결정', category: 'Risk', phonetics: ['언더라이팅', '여신심사', '인수심사'] }
    ]
  },
  manufacturing: {
    id: 'manufacturing',
    name: '제조 / 하드웨어 / SCM',
    icon: 'Factory',
    color: 'from-amber-500 to-orange-600',
    description: '생산라인 수율, 부품 BOM, 설비보전(TPM), 공급망 및 품질관리(QC) 용어 최적화',
    terms: [
      { term: 'BOM (Bill of Materials)', definition: '제품 하나를 제조하는 데 필요한 모든 부품, 원자재, 서브어셈블리의 목록 및 소요량 명세서', category: 'Production', phonetics: ['비오엠', '봄', '자재명세서'] },
      { term: 'Yield (수율)', definition: '투입된 원자재 대비 결함 없이 완성된 양품의 비율 (%)', category: 'Quality', phonetics: ['수율', '일드', '양품률'] },
      { term: 'SCM (공급망 관리)', definition: '원자재 조달부터 제조, 유통, 최종 배송까지의 전 공급망 프로세스를 최적화하는 관리 체계', category: 'Supply Chain', phonetics: ['에스씨엠', '공급망', '물류체인'] },
      { term: 'Lead Time (리드타임)', definition: '발주 또는 생산 시작 시점부터 완제품이 납품될 때까지 걸리는 총 소요 시간', category: 'Planning', phonetics: ['리드타임', '소요시간', '납기'] },
      { term: 'QC / QA (품질관리)', definition: '제조 공정 중 불량을 검출하고 규격 적합성을 보증하는 품질관리 체계', category: 'Quality', phonetics: ['큐씨', '큐에이', '품질관리'] },
      { term: 'OEM / ODM', definition: '주문자 상표 부착 생산(OEM) 및 주문자 개발 생산(ODM)', category: 'Contract', phonetics: ['오이엠', '오디엠', '위탁생산'] },
      { term: 'TPM (전사적 설비보전)', definition: '설비의 가동 효율을 극대화하고 고장 및 정지를 제로화하기 위한 보전 활동', category: 'Equipment', phonetics: ['티피엠', '설비보전', '예방보전'] },
      { term: 'Defect Rate (불량률 / PPM)', definition: '백만 개 생산당 발생하는 불량품 개수(PPM) 또는 백분율 불량률 지표', category: 'Quality', phonetics: ['불량률', '피피엠', '디펙트'] },
      { term: 'Tooling / Mold (금형)', definition: '동일한 형상의 제품을 대량 사출/프레스 성형하기 위한 정밀 금속 틀', category: 'Tooling', phonetics: ['금형', '몰드', '사출금형'] }
    ]
  },
  marketing: {
    id: 'marketing',
    name: '마케팅 / 이커머스 / 세일즈',
    icon: 'Megaphone',
    color: 'from-pink-500 to-rose-600',
    description: '퍼포먼스 마케팅, 그로스 퍼널, 광고 지표(ROAS/CAC) 및 전환율 최적화 용어',
    terms: [
      { term: 'ROAS (광고비 대비 매출액)', definition: '집행한 광고비 대비 얼마의 매출이 발생했는지를 나타내는 핵심 광고 효율 지표 (매출/광고비 * 100)', category: 'Ad Tech', phonetics: ['알오에이에스', '로아스', '광고수익률'] },
      { term: 'CAC (고객 획득 비용)', definition: '신규 고객 1명을 유치하기 위해 지출된 총 마케팅 및 영업 비용', category: 'Growth', phonetics: ['씨에이씨', '캑', '고객획득비용'] },
      { term: 'LTV (고객 생애 가치)', definition: '고객 한 명이 서비스 이용 기간 동안 기업에 기여하는 총 순이익 가치', category: 'Customer', phonetics: ['엘티브이', '생애가치', '고객가치'] },
      { term: 'Funnel / CVR (전환율)', definition: '유입 > 장바구니 > 결제완료 등 각 단계별 고객 전환율(Conversion Rate)', category: 'Funnel', phonetics: ['전환율', '씨브이알', '퍼널', '이탈률'] },
      { term: 'A/B Testing', definition: '두 가지 이상의 디자인/문구를 동시 테스트하여 더 성과가 좋은 버전을 채택하는 기법', category: 'Experiment', phonetics: ['에이비테스트', '에이비테스팅', '분할테스트'] },
      { term: 'CTR (클릭률) / CPC (클릭당비용)', definition: '노출 대비 클릭 비율(CTR) 및 클릭 1회당 과금 금액(CPC)', category: 'Ad Tech', phonetics: ['씨티알', '씨피씨', '클릭률', '클릭단가'] },
      { term: 'CRM (고객관계관리)', definition: '기존 고객의 재구매와 충성도를 높이기 위한 카카오톡 알림톡, 이메일, 푸시 마케팅', category: 'Retention', phonetics: ['씨알엠', '리텐션', '푸시마케팅'] },
      { term: 'Lead Generation (리드 발굴)', definition: 'B2B/B2C에서 잠재 고객의 연락처와 구매 의향을 확보하는 마케팅 활동', category: 'Sales', phonetics: ['리드발굴', '리드제너레이션', '인바운드리드'] }
    ]
  },
  general: {
    id: 'general',
    name: '일반 비즈니스 / 전략 / HR',
    icon: 'Briefcase',
    color: 'from-purple-500 to-violet-600',
    description: '경영 전략, OKR, KPI, 예산 편성 및 사내 조직 운영 전반',
    terms: [
      { term: 'OKR (Objective & Key Results)', definition: '조직의 도전적 목표(O)와 이를 달성했는지 측정하는 핵심 결과 지표(KR)', category: 'Strategy', phonetics: ['오케이알', '목표관리'] },
      { term: 'KPI (핵심 성과 지표)', definition: '조직이나 개인의 목표 달성도를 측정하기 위한 정량화된 핵심 지표', category: 'Performance', phonetics: ['케이피아이', '성과지표'] },
      { term: 'Milestone (마일스톤)', definition: '프로젝트 진행 과정에서 중요한 주요 전환점이나 단계별 마감 일정', category: 'Management', phonetics: ['마일스톤', '중간점검', '주요마감'] },
      { term: 'TF (Task Force)', definition: '특정 현안이나 신규 프로젝트 해결을 위해 여러 부서에서 차출되어 임시 구성된 팀', category: 'Organization', phonetics: ['티에프', '태스크포스', '티에프팀'] },
      { term: 'CAPEX / OPEX', definition: '자본적 지출(설비/자산 투자) 및 운영 비용(인건비/임차료 등 일상 경비)', category: 'Finance', phonetics: ['카펙스', '오펙스', '자본지출', '운영비용'] }
    ]
  }
};
