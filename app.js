(() => {
  "use strict";

  const STORAGE_KEY = "biz-dashboard-data-v8";
  const THEME_KEY = "biz-dashboard-theme";
  const CATEGORIES = ["인건비", "연구재료비", "연구활동비", "기타"];
  const ITEMIZED_CATEGORIES = ["연구재료비", "연구활동비"];

  /* ---------------------------------------------------------------- */
  /* Utilities                                                         */
  /* ---------------------------------------------------------------- */

  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  const todayISO = () => new Date().toISOString().slice(0, 10);
  const fmtWon = (n) => (Math.round(n) || 0).toLocaleString("ko-KR") + "원";
  const fmtDate = (iso) => {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  };
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000);
  const escapeHtml = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function toast(msg) {
    const el = document.getElementById("toast");
    el.textContent = msg;
    el.hidden = false;
    clearTimeout(toast._t);
    toast._t = setTimeout(() => { el.hidden = true; }, 2200);
  }

  /* ---------------------------------------------------------------- */
  /* Data layer                                                        */
  /* ---------------------------------------------------------------- */

  function emptyBudgetPlan() {
    return { 기타: 0 };
  }

  function seedData() {
    const P = (o) => ({
      id: uid(),
      memo: "",
      progress: 0,
      budget: { governmentFund: 0, selfFund: 0 },
      budgetPlan: emptyBudgetPlan(),
      budgetItems: [],
      laborBudget: { cash: 0, inKind: 0 },
      expenses: [],
      milestones: [],
      ...o,
    });
    const M = (title, dueDate, done = false) => ({ id: uid(), title, dueDate, done });
    const E = (date, category, amount, memo) => ({ id: uid(), date, category, amount, memo });
    const BI = (category, name, usage, quantity, cash, inKind, period, location) => ({
      id: uid(),
      category,
      name,
      usage,
      quantity,
      cash,
      inKind,
      period,
      location,
    });

    const weakTechProject = P({
      name: "약자를 위한 기술개발 지원사업",
      type: "정부지원사업",
      agency: "서울경제진흥원(SBA)",
      status: "진행중",
      startDate: "2025-06-01",
      endDate: "2026-07-31",
      memo: "과제번호 WW250072, 과제명: AI 기반 실시간 노인 돌봄 위험 예측 모니터링 연구 개발(협약차수 1). 정부지원금 구조(서울경제진흥원 사업비관리시스템 기준): 총 사업비 160,000,000원 = 시지원연구개발비(정부, 현금) 120,000,000원(지원비율 75%) + 기관부담연구개발비(자부담) 40,000,000원(현금 4,000,000원 + 현물 36,000,000원). 실행 집행 내역은 2026-01-16~2026-05-07 집행분(연구활동비 7건, 내부인건비 8건, 합계 109,519,485원)을 반영함. 단, 원본 집행내역 파일 자체의 '합계' 행은 183,981,095원으로 더 높게 표기되어 있어, 이 파일에 포함되지 않은 집행 건이 남아있을 수 있음 — 전체 내역인지 원본 시스템에서 재확인 필요.",
      progress: 92,
      budget: { governmentFund: 120000000, selfFund: 40000000 },
      budgetPlan: { 기타: 0 },
      laborBudget: { cash: 77500000, inKind: 36000000 },
      budgetItems: [
        BI("연구활동비", "이행보증보험증권 발급수수료", "이행보증보험증권 발급수수료", 1, 1319370, 0, "", "영수증"),
        BI("연구활동비", "위탁정산수수료", "위탁정산수수료", 1, 700000, 0, "", "정산서"),
        BI("연구활동비", "소프트웨어 활용비", "AI알고리즘 개발플랫폼(메가존 AWS)", 1, 43480630, 0, "25.09~26.08", "클라우드"),
        BI("연구활동비", "회의비", "", 1, 1000000, 0, "", ""),
      ],
      expenses: [
        E("2026-01-16", "연구활동비", 6628529, "메가존클라우드 AWS 클라우드 요금(연구활동비, 17:44:33 집행)"),
        E("2026-01-16", "연구활동비", 6859667, "메가존클라우드 AWS 클라우드 요금(연구활동비, 17:44:31 집행)"),
        E("2026-01-16", "연구활동비", 6263084, "메가존클라우드 AWS 클라우드 요금(연구활동비, 17:44:29 집행)"),
        E("2026-04-09", "연구활동비", 4591281, "메가존클라우드 AWS 클라우드 요금(연구활동비, 11:44:55 집행)"),
        E("2026-04-09", "연구활동비", 6573913, "메가존클라우드 AWS 클라우드 요금(연구활동비, 11:44:53 집행)"),
        E("2026-04-09", "연구활동비", 7251131, "메가존클라우드 AWS 클라우드 요금(연구활동비, 11:44:52 집행)"),
        E("2026-05-07", "연구활동비", 3875140, "메가존클라우드 AWS 클라우드 요금(연구활동비, 15:39:25 집행)"),
      ],
      milestones: [
        M("사업 종료 및 최종보고서 제출", "2026-07-31"),
        M("클라우드 라이선스 만료(메가존 AWS)", "2026-08-31"),
      ],
    });

    const projects = [
      weakTechProject,
      P({
        name: "테스트베드 서울 실증지원사업",
        type: "정부지원사업",
        agency: "서울경제진흥원(SBA)",
        status: "진행중",
        startDate: "2026-07-01",
        endDate: "2027-06-30",
        memo: "시지원연구개발비(정부) 2억원 + 기관부담(자부담, 현금 6,918,720원 + 현물 59,800,000원) 66,718,720원. 연구재료비·연구활동비 세부 내역은 원본 예산 계획표 기준(2026-07-22 갱신).",
        progress: 6,
        budget: { governmentFund: 200000000, selfFund: 66718720 },
        budgetPlan: { 기타: 0 },
        laborBudget: { cash: 152200000, inKind: 59800000 },
        budgetItems: [
          BI("연구재료비", "시제품 제작 경비", "늘 밴드 제작", 120, 16800000, 0, "26.05~26.06", "실증기관"),
          BI("연구재료비", "시제품 제작 경비", "늘 허브 제작", 80, 8000000, 0, "26.05~26.06", "실증기관"),
          BI("연구재료비", "시제품 제작 경비", "늘 차저 제작", 30, 1800000, 0, "26.05~26.06", "실증기관"),
          BI("연구활동비", "이행보증보험증권 발급수수료", "이행보증보험증권 발급수수료", 1, 995720, 0, "2026.07", "회계"),
          BI("연구활동비", "위탁정산수수료", "위탁정산수수료", 1, 1265000, 0, "2027.06", "회계"),
          BI("연구활동비", "소프트웨어 활용비", "AWS 클라우드(메가존)", 1, 17858000, 0, "26.07~27.06", "클라우드"),
          BI("연구활동비", "회의비", "연구개발 회의비", 10, 3000000, 0, "26.07~27.06", "회계"),
          BI("연구활동비", "외부 전문기술 활용비", "3자검증 인증비", 1, 5000000, 0, "2027.06", "회계"),
        ],
        milestones: [
          M("실증기관 협의 및 실증 계획 수립", "2026-11-30"),
          M("플랫폼 구축 및 시스템 환경 구성", "2026-12-31"),
          M("웨어러블 기반 바이탈 모니터링 실증 운영", "2027-01-31"),
          M("요양기관 업무시스템 연동 및 기록 자동화 검증", "2027-02-28"),
          M("데이터 수집 안정성 및 AI 탐지 정확도 분석", "2027-03-31"),
          M("실증 운영 모니터링 및 현장 점검", "2027-04-30"),
          M("실증 결과 분석 및 성과 보고", "2027-05-31"),
        ],
      }),
      P({
        name: "현대건설 실증사업",
        type: "정부지원사업",
        agency: "창업진흥원(K-Startup)",
        status: "진행중",
        startDate: "2026-07-01",
        endDate: "2027-01-31",
        memo: "K-Startup 플랫폼 연계, 현대건설 실증단지 파트너십. 정부/민간 재원 구조 미확인 — 현재는 자체 소요비용 추정치(예산 계획) 기준(정부지원금 0으로 표기, 확인 후 입력 필요). 실제 집행 내역은 아직 등록되지 않았습니다. 비목 개편(외주비/장비비→연구재료비·연구활동비)에 따라 임의로 재분류함 — 확인 후 필요시 조정 요망.",
        progress: 10,
        budget: { governmentFund: 0, selfFund: 90750000 },
        budgetPlan: { 기타: 0 },
        laborBudget: { cash: 35000000, inKind: 0 },
        budgetItems: [
          BI("연구재료비", "갤럭시 워치", "", 20, 400000, 8000000, "", ""),
          BI("연구재료비", "늘밴드", "", 20, 150000, 3000000, "", ""),
          BI("연구재료비", "늘허브", "", 20, 100000, 2000000, "", ""),
          BI("연구재료비", "늘밴드차저", "", 20, 100000, 2000000, "", ""),
          BI("연구재료비", "개발시료 AOS", "", 1, 2000000, 2000000, "", ""),
          BI("연구재료비", "개발시료 iOS", "", 1, 2500000, 2500000, "", ""),
          BI("연구활동비", "UI/UX 디자인", "", 1, 15000000, 15000000, "", ""),
          BI("연구활동비", "지급수수료", "회계", 1, 500000, 500000, "", ""),
        ],
        milestones: [
          M("설계·기획 완료(대상단지 협의·참여자 모집)", "2026-08-31"),
          M("개발 완료(온보딩·AI연동·데이터수집로직)", "2026-11-30"),
          M("실증 운영 완료(리워드 교육·안부입력·웨어러블 수집)", "2026-12-31"),
          M("최종 실증 검증 및 성과 보고", "2027-01-31"),
        ],
      }),
      P({
        name: "수출바우처사업",
        type: "정부지원사업",
        agency: "중소벤처기업진흥공단",
        status: "진행중",
        startDate: "2026-04-01",
        endDate: "2026-12-31",
        memo: "사업계획서(2026.01.09 제출) 기준. 정부 지원비율 70%(정부보조금 29,960,000원 + 기업부담금 12,840,000원 = 총 42,800,000원). 실행 집행 내역은 아직 등록되지 않아 [실행 집행 내역]에서 입력 필요. 비목 개편(외주비/여비→연구활동비)에 따라 3개 프로그램을 모두 연구활동비로 재분류함 — 확인 후 필요시 조정 요망.",
        progress: 40,
        budget: { governmentFund: 29960000, selfFund: 12840000 },
        budgetPlan: { 기타: 0 },
        laborBudget: { cash: 0, inKind: 0 },
        budgetItems: [
          BI("연구활동비", "일문 홈페이지 구축", "", 1, 12960000, 0, "2026.04~2026.12", ""),
          BI("연구활동비", "전시회/행사/해외영업지원", "", 1, 15000000, 0, "2026.04~2026.12", ""),
          BI("연구활동비", "법무/세무/회계 컨설팅", "", 1, 14840000, 0, "2026.04~2026.12", ""),
        ],
        milestones: [
          M("바우처 발급 및 사업 개시", "2026-04-01", true),
          M("일문 홈페이지 구축 완료", "2026-12-31"),
          M("전시회·해외영업지원 완료", "2026-12-31"),
          M("법무·세무·회계 컨설팅 완료", "2026-12-31"),
        ],
      }),
    ];

    const employees = [
      { id: uid(), name: "김운봉", position: "대표이사", memo: "" },
      { id: uid(), name: "한규희", position: "CSO", memo: "" },
      { id: uid(), name: "이경호", position: "CFO", memo: "" },
      { id: uid(), name: "박재덕", position: "팀장", memo: "" },
      { id: uid(), name: "김세일", position: "팀장", memo: "" },
      { id: uid(), name: "유소담", position: "매니저", memo: "" },
      { id: uid(), name: "이수민", position: "팀장", memo: "" },
      { id: uid(), name: "서정호", position: "팀장", memo: "" },
      { id: uid(), name: "윤형수", position: "매니저", memo: "" },
      { id: uid(), name: "김상수", position: "매니저", memo: "" },
    ];

    const unassignedLaborEmployee = {
      id: uid(),
      name: "내부인건비(세부인원 미기재)",
      position: "",
      memo: "약자기술 사업 집행내역 파일의 '내부인건비' 항목에 개인별 배분 정보가 없어 임시로 묶어 등록함 — 실제 대상자 확인 후 개별 직원으로 재배분 필요.",
    };
    employees.push(unassignedLaborEmployee);

    const L = (month, amount, memo) => ({
      id: uid(),
      employeeId: unassignedLaborEmployee.id,
      projectId: weakTechProject.id,
      month,
      amount,
      memo,
    });
    const laborEntries = [
      L("2026-05", 2575010, "내부인건비 집행(2026-05-07 15:22:52)"),
      L("2026-05", 2575010, "내부인건비 집행(2026-05-07 15:22:50)"),
      L("2026-05", 7375010, "내부인건비 집행(2026-05-07 15:22:48)"),
      L("2026-05", 7375010, "내부인건비 집행(2026-05-07 15:22:47)"),
      L("2026-05", 12215010, "내부인건비 집행(2026-05-07 15:22:45)"),
      L("2026-05", 12215010, "내부인건비 집행(2026-05-07 15:22:43)"),
      L("2026-05", 11573340, "내부인건비 집행(2026-05-07 15:22:42)"),
      L("2026-05", 11573340, "내부인건비 집행(2026-05-07 15:22:40)"),
    ];

    return { projects, employees, laborEntries };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          projects: Array.isArray(parsed.projects) ? parsed.projects : [],
          employees: Array.isArray(parsed.employees) ? parsed.employees : [],
          laborEntries: Array.isArray(parsed.laborEntries) ? parsed.laborEntries : [],
        };
      }
    } catch (e) {
      console.error("Failed to load data", e);
    }
    const seeded = seedData();
    save(seeded);
    return seeded;
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  const initialState = load();
  let projects = initialState.projects;
  let employees = initialState.employees;
  let laborEntries = initialState.laborEntries;
  let activeProjectId = null;
  let activeTab = "overview";

  const persist = () => save({ projects, employees, laborEntries });

  /* ---------------------------------------------------------------- */
  /* Derived calculations                                              */
  /* ---------------------------------------------------------------- */

  function budgetTotal(p) {
    return (p.budget.governmentFund || 0) + (p.budget.selfFund || 0);
  }
  function laborSpentForProject(p) {
    return laborEntries
      .filter((le) => le.projectId === p.id)
      .reduce((sum, le) => sum + (Number(le.amount) || 0), 0);
  }
  function spentAmount(p) {
    const expenseTotal = p.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return expenseTotal + laborSpentForProject(p);
  }
  function categorySpent(p, category) {
    if (category === "인건비") return laborSpentForProject(p);
    return p.expenses.filter((e) => e.category === category).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  }
  function categoryBudget(p, category) {
    if (category === "인건비") {
      const lb = p.laborBudget || { cash: 0, inKind: 0 };
      return (Number(lb.cash) || 0) + (Number(lb.inKind) || 0);
    }
    if (ITEMIZED_CATEGORIES.includes(category)) {
      if (!p.budgetItems) return 0;
      return p.budgetItems
        .filter((item) => item.category === category)
        .reduce((sum, item) => sum + (Number(item.cash) || 0) + (Number(item.inKind) || 0), 0);
    }
    return (p.budgetPlan && p.budgetPlan[category]) || 0;
  }
  function expectedProgress(p) {
    const start = new Date(p.startDate).getTime();
    const end = new Date(p.endDate).getTime();
    const now = Date.now();
    if (!(end > start)) return 100;
    return clamp(((now - start) / (end - start)) * 100, 0, 100);
  }
  function scheduleHealth(p) {
    if (p.status === "완료") return { label: "완료", tone: "good" };
    if (p.status === "보류") return { label: "보류", tone: "muted" };
    const overdue = new Date(p.endDate) < new Date(todayISO());
    if (overdue && p.progress < 100) return { label: "기한초과", tone: "critical" };
    const exp = expectedProgress(p);
    if (p.progress + 8 < exp) return { label: "지연", tone: "critical" };
    return { label: "정상", tone: "good" };
  }
  function nextMilestone(p) {
    const open = p.milestones.filter((m) => !m.done).sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return open[0] || null;
  }

  /* ---------------------------------------------------------------- */
  /* Rendering: summary tiles                                          */
  /* ---------------------------------------------------------------- */

  function renderSummary() {
    const el = document.getElementById("summary-tiles");
    const totalBudget = projects.reduce((s, p) => s + budgetTotal(p), 0);
    const totalSpent = projects.reduce((s, p) => s + spentAmount(p), 0);
    const execRate = totalBudget ? (totalSpent / totalBudget) * 100 : 0;
    const active = projects.filter((p) => p.status === "진행중");
    const avgProgress = active.length ? active.reduce((s, p) => s + (p.progress || 0), 0) / active.length : 0;
    const govCount = projects.filter((p) => p.type === "정부지원사업").length;

    const in30 = projects.flatMap((p) =>
      p.milestones
        .filter((m) => !m.done)
        .map((m) => ({ ...m, project: p }))
    ).filter((m) => {
      const d = daysBetween(todayISO(), m.dueDate);
      return d <= 30;
    });
    const overdueCount = in30.filter((m) => daysBetween(todayISO(), m.dueDate) < 0).length;

    const tiles = [
      { label: "총 사업 수", value: `${projects.length}`, unit: "건", sub: `정부지원 ${govCount}건 · 자체 ${projects.length - govCount}건` },
      { label: "총 사업비", value: fmtWon(totalBudget), sub: `정부지원금 ${fmtWon(projects.reduce((s,p)=>s+(p.budget.governmentFund||0),0))}` },
      { label: "총 집행액", value: fmtWon(totalSpent), sub: `집행률 ${execRate.toFixed(1)}%` },
      { label: "진행중 평균 진행률", value: `${avgProgress.toFixed(0)}%`, sub: `진행중 ${active.length}건` },
      {
        label: "임박 마일스톤 (30일 이내)",
        value: `${in30.length}`,
        unit: "건",
        sub: overdueCount ? `지연 ${overdueCount}건` : "지연 없음",
        subTone: overdueCount ? "critical" : "good",
      },
    ];

    el.innerHTML = tiles
      .map(
        (t) => `
      <div class="tile">
        <div class="tile-label">${t.label}</div>
        <div class="tile-value">${t.value}${t.unit ? `<span class="unit">${t.unit}</span>` : ""}</div>
        <div class="tile-sub${t.subTone ? ` status-${t.subTone}` : ""}">${t.sub}</div>
      </div>`
      )
      .join("");
  }

  /* ---------------------------------------------------------------- */
  /* Rendering: charts (budget + progress bar lists)                   */
  /* ---------------------------------------------------------------- */

  function renderBudgetChart() {
    const el = document.getElementById("budget-chart");
    if (!projects.length) {
      el.innerHTML = `<p class="empty-note">등록된 프로젝트가 없습니다.</p>`;
      return;
    }
    el.innerHTML = projects
      .map((p) => {
        const total = budgetTotal(p);
        const spent = spentAmount(p);
        const pct = total ? (spent / total) * 100 : 0;
        const over = spent > total;
        const width = clamp(pct, 0, 100);
        return `
        <div class="bar-row">
          <div class="bar-row-top">
            <span class="bar-row-name">${escapeHtml(p.name)}</span>
            <span class="bar-row-value">${fmtWon(spent)} / ${fmtWon(total)}${over ? ' <span class="bar-row-badge badge-critical">초과</span>' : ""}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill${over ? " over" : ""}" style="width:${width}%"></div>
          </div>
        </div>`;
      })
      .join("");
  }

  function renderProgressChart() {
    const el = document.getElementById("progress-chart");
    if (!projects.length) {
      el.innerHTML = `<p class="empty-note">등록된 프로젝트가 없습니다.</p>`;
      return;
    }
    el.innerHTML = projects
      .map((p) => {
        const health = scheduleHealth(p);
        const badgeClass = health.tone === "critical" ? "badge-critical" : health.tone === "good" ? "badge-good" : "badge-muted";
        return `
        <div class="bar-row">
          <div class="bar-row-top">
            <span class="bar-row-name">${escapeHtml(p.name)}</span>
            <span class="bar-row-value">${p.progress || 0}% <span class="bar-row-badge ${badgeClass}">${health.label}</span></span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width:${clamp(p.progress || 0, 0, 100)}%"></div>
          </div>
        </div>`;
      })
      .join("");
  }

  /* ---------------------------------------------------------------- */
  /* Rendering: deadlines                                              */
  /* ---------------------------------------------------------------- */

  function renderDeadlines() {
    const el = document.getElementById("deadlines-list");
    const items = projects
      .flatMap((p) => p.milestones.filter((m) => !m.done).map((m) => ({ ...m, project: p })))
      .filter((m) => daysBetween(todayISO(), m.dueDate) <= 30)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

    if (!items.length) {
      el.innerHTML = `<p class="empty-note">임박하거나 지연된 마일스톤이 없습니다.</p>`;
      return;
    }

    el.innerHTML = items
      .map((m) => {
        const d = daysBetween(todayISO(), m.dueDate);
        const overdue = d < 0;
        const dLabel = overdue ? `${Math.abs(d)}일 지남` : d === 0 ? "오늘" : `D-${d}`;
        return `
        <div class="deadline-row" data-open-project="${m.project.id}">
          <div class="deadline-main">
            <span class="deadline-title">${escapeHtml(m.title)}</span>
            <span class="deadline-project">${escapeHtml(m.project.name)}</span>
          </div>
          <div class="deadline-meta">
            <span class="deadline-date">${fmtDate(m.dueDate)}</span>
            <span class="bar-row-badge ${overdue ? "badge-critical" : "badge-muted"}">${dLabel}</span>
          </div>
        </div>`;
      })
      .join("");

    el.querySelectorAll("[data-open-project]").forEach((row) => {
      row.style.cursor = "pointer";
      row.addEventListener("click", () => openModal(row.dataset.openProject, "schedule"));
    });
  }

  /* ---------------------------------------------------------------- */
  /* Rendering: project grid                                           */
  /* ---------------------------------------------------------------- */

  function getFilters() {
    return {
      search: document.getElementById("filter-search").value.trim().toLowerCase(),
      type: document.getElementById("filter-type").value,
      status: document.getElementById("filter-status").value,
    };
  }

  function renderProjectGrid() {
    const el = document.getElementById("project-grid");
    const f = getFilters();
    const filtered = projects.filter((p) => {
      if (f.type && p.type !== f.type) return false;
      if (f.status && p.status !== f.status) return false;
      if (f.search) {
        const hay = `${p.name} ${p.agency} ${p.memo}`.toLowerCase();
        if (!hay.includes(f.search)) return false;
      }
      return true;
    });

    if (!filtered.length) {
      el.innerHTML = `<div class="empty-state">조건에 맞는 프로젝트가 없습니다.</div>`;
      return;
    }

    el.innerHTML = filtered
      .map((p) => {
        const total = budgetTotal(p);
        const spent = spentAmount(p);
        const nm = nextMilestone(p);
        const typePill = p.type === "정부지원사업" ? "pill-gov" : p.type === "자체사업" ? "pill-self" : "pill-other";
        return `
        <article class="project-card" data-id="${p.id}">
          <div class="project-card-top">
            <div>
              <h3 class="project-name">${escapeHtml(p.name)}</h3>
              ${p.agency ? `<div class="project-agency">${escapeHtml(p.agency)}</div>` : ""}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px; align-items:flex-end;">
              <span class="pill ${typePill}">${escapeHtml(p.type)}</span>
              <span class="status-pill status-${p.status}">${p.status}</span>
            </div>
          </div>
          <div class="project-period">${fmtDate(p.startDate)} ~ ${fmtDate(p.endDate)}</div>
          <div class="project-progress-row">
            <div class="bar-track"><div class="bar-fill" style="width:${clamp(p.progress || 0, 0, 100)}%"></div></div>
            <span class="project-progress-pct">${p.progress || 0}%</span>
          </div>
          <div class="project-budget-line">
            <span>사업비 ${fmtWon(total)}</span>
            <span>집행 ${fmtWon(spent)}</span>
          </div>
          <div class="project-card-footer">${nm ? `다음 일정: ${escapeHtml(nm.title)} (${fmtDate(nm.dueDate)})` : "예정된 마일스톤 없음"}</div>
        </article>`;
      })
      .join("");

    el.querySelectorAll(".project-card").forEach((card) => {
      card.addEventListener("click", () => openModal(card.dataset.id, "overview"));
    });
  }

  /* ---------------------------------------------------------------- */
  /* Full re-render                                                    */
  /* ---------------------------------------------------------------- */

  function renderAll() {
    renderSummary();
    renderBudgetChart();
    renderProgressChart();
    renderDeadlines();
    renderProjectGrid();
  }

  /* ---------------------------------------------------------------- */
  /* Modal: open / close / tabs                                        */
  /* ---------------------------------------------------------------- */

  const backdrop = document.getElementById("modal-backdrop");
  const modalTitle = document.getElementById("modal-title");

  function getActiveProject() {
    return projects.find((p) => p.id === activeProjectId) || null;
  }

  function openModal(projectId, tab = "overview") {
    activeProjectId = projectId;
    activeTab = tab;
    const p = getActiveProject();
    if (!p) return;
    modalTitle.textContent = p.name;
    fillOverviewForm(p);
    fillBudgetForm(p);
    fillBudgetPlanForm(p);
    renderExpenseTable(p);
    renderMilestoneList(p);
    setActiveTab(tab);
    backdrop.hidden = false;
  }

  function closeModal() {
    backdrop.hidden = true;
    activeProjectId = null;
  }

  function setActiveTab(tab) {
    activeTab = tab;
    document.querySelectorAll(".tab-btn").forEach((b) => b.classList.toggle("active", b.dataset.tab === tab));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.toggle("active", p.dataset.panel === tab));
  }

  document.getElementById("modal-tabs").addEventListener("click", (e) => {
    const btn = e.target.closest(".tab-btn");
    if (btn) setActiveTab(btn.dataset.tab);
  });
  document.getElementById("modal-close").addEventListener("click", closeModal);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !backdrop.hidden) closeModal();
  });

  /* ---------------------------------------------------------------- */
  /* Overview tab                                                      */
  /* ---------------------------------------------------------------- */

  const formOverview = document.getElementById("form-overview");
  const fieldAgency = document.getElementById("field-agency");

  function fillOverviewForm(p) {
    formOverview.name.value = p.name;
    formOverview.type.value = p.type;
    formOverview.agency.value = p.agency || "";
    formOverview.status.value = p.status;
    formOverview.startDate.value = p.startDate;
    formOverview.endDate.value = p.endDate;
    formOverview.memo.value = p.memo || "";
    formOverview.progress.value = p.progress || 0;
    toggleAgencyField();
  }

  function toggleAgencyField() {
    fieldAgency.style.display = formOverview.type.value === "정부지원사업" ? "" : "none";
  }
  formOverview.type.addEventListener("change", toggleAgencyField);

  formOverview.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = getActiveProject();
    if (!p) return;
    p.name = formOverview.name.value.trim() || "이름 없는 프로젝트";
    p.type = formOverview.type.value;
    p.agency = formOverview.agency.value.trim();
    p.status = formOverview.status.value;
    p.startDate = formOverview.startDate.value;
    p.endDate = formOverview.endDate.value;
    p.memo = formOverview.memo.value.trim();
    p.progress = clamp(Number(formOverview.progress.value) || 0, 0, 100);
    persist();
    modalTitle.textContent = p.name;
    renderAll();
    toast("저장되었습니다");
  });

  document.getElementById("btn-delete-project").addEventListener("click", () => {
    const p = getActiveProject();
    if (!p) return;
    if (!confirm(`"${p.name}" 프로젝트를 삭제할까요? 이 작업은 되돌릴 수 없습니다.`)) return;
    projects = projects.filter((x) => x.id !== p.id);
    laborEntries = laborEntries.filter((le) => le.projectId !== p.id);
    persist();
    closeModal();
    renderAll();
    refreshLaborSelects();
    renderLaborEntries();
    renderLaborPivot();
    toast("프로젝트가 삭제되었습니다");
  });

  /* ---------------------------------------------------------------- */
  /* Budget tab                                                        */
  /* ---------------------------------------------------------------- */

  const formBudgetTotal = document.getElementById("form-budget-total");
  const budgetReadout = document.getElementById("budget-total-readout");

  function fillBudgetForm(p) {
    formBudgetTotal.governmentFund.value = p.budget.governmentFund || 0;
    formBudgetTotal.selfFund.value = p.budget.selfFund || 0;
    updateBudgetReadout(p);
  }

  function updateBudgetReadout(p) {
    const total = budgetTotal(p);
    const spent = spentAmount(p);
    const remaining = total - spent;
    budgetReadout.innerHTML = `
      <span>총 사업비 <strong>${fmtWon(total)}</strong></span>
      <span>집행액 <strong>${fmtWon(spent)}</strong></span>
      <span>잔액 <strong style="${remaining < 0 ? "color:var(--critical)" : ""}">${fmtWon(remaining)}</strong></span>
    `;
  }

  formBudgetTotal.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = getActiveProject();
    if (!p) return;
    p.budget.governmentFund = Number(formBudgetTotal.governmentFund.value) || 0;
    p.budget.selfFund = Number(formBudgetTotal.selfFund.value) || 0;
    persist();
    updateBudgetReadout(p);
    renderAll();
    toast("예산이 저장되었습니다");
  });

  /* ---------------------------------------------------------------- */
  /* Budget tab: category-level budget plan vs. actual execution       */
  /* ---------------------------------------------------------------- */

  const formBudgetPlan = document.getElementById("form-budget-plan");
  const formBudgetItem = document.getElementById("form-budget-item");
  const MANUAL_CATEGORIES = CATEGORIES.filter((c) => c !== "인건비" && !ITEMIZED_CATEGORIES.includes(c));

  function fillBudgetPlanForm(p) {
    if (!p.budgetPlan) p.budgetPlan = emptyBudgetPlan();
    if (!p.budgetItems) p.budgetItems = [];
    MANUAL_CATEGORIES.forEach((cat) => {
      formBudgetPlan[cat].value = p.budgetPlan[cat] || 0;
    });
    renderBudgetItemsTable(p);
    renderCategoryBudgetTable(p);
  }

  function renderBudgetItemsTable(p) {
    const tbody = document.querySelector("#budget-item-table tbody");
    if (!p.budgetItems.length) {
      tbody.innerHTML = `<tr><td colspan="9" class="empty-note">등록된 세부 내역이 없습니다.</td></tr>`;
      return;
    }
    const sorted = [...p.budgetItems].sort((a, b) => a.category.localeCompare(b.category));
    tbody.innerHTML = sorted
      .map(
        (item) => `
      <tr data-budget-item-id="${item.id}">
        <td>${escapeHtml(item.category)}</td>
        <td>${escapeHtml(item.name)}</td>
        <td>${escapeHtml(item.usage || "")}</td>
        <td class="num">${item.quantity || ""}</td>
        <td class="num">${fmtWon(item.cash || 0)}</td>
        <td class="num">${fmtWon(item.inKind || 0)}</td>
        <td>${escapeHtml(item.period || "")}</td>
        <td>${escapeHtml(item.location || "")}</td>
        <td><button class="row-delete" data-del-budget-item="${item.id}" title="삭제">✕</button></td>
      </tr>`
      )
      .join("");
  }

  formBudgetItem.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = getActiveProject();
    if (!p) return;
    const form = e.target;
    if (!p.budgetItems) p.budgetItems = [];
    p.budgetItems.push({
      id: uid(),
      category: form.category.value,
      name: form.name.value.trim(),
      usage: form.usage.value.trim(),
      quantity: Number(form.quantity.value) || 0,
      cash: Number(form.cash.value) || 0,
      inKind: Number(form.inKind.value) || 0,
      period: form.period.value.trim(),
      location: form.location.value.trim(),
    });
    persist();
    renderBudgetItemsTable(p);
    renderCategoryBudgetTable(p);
    renderAll();
    form.reset();
    toast("세부 내역이 추가되었습니다");
  });

  document.querySelector("#budget-item-table tbody").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del-budget-item]");
    if (!btn) return;
    const p = getActiveProject();
    if (!p) return;
    p.budgetItems = p.budgetItems.filter((item) => item.id !== btn.dataset.delBudgetItem);
    persist();
    renderBudgetItemsTable(p);
    renderCategoryBudgetTable(p);
    renderAll();
  });

  function renderCategoryBudgetTable(p) {
    const tbody = document.querySelector("#category-budget-table tbody");
    tbody.innerHTML = CATEGORIES.map((cat) => {
      const budget = categoryBudget(p, cat);
      const spent = categorySpent(p, cat);
      const remaining = budget - spent;
      const over = remaining < 0;
      return `
      <tr>
        <td>${cat}${cat === "인건비" ? ' <span class="tile-sub" style="display:inline;">(인건비 관리 페이지 집행 반영)</span>' : ""}</td>
        <td class="num">${fmtWon(budget)}</td>
        <td class="num">${fmtWon(spent)}</td>
        <td class="num" style="${over ? "color:var(--critical); font-weight:700;" : ""}">${fmtWon(remaining)}</td>
      </tr>`;
    }).join("");
  }

  formBudgetPlan.addEventListener("submit", (e) => {
    e.preventDefault();
    const p = getActiveProject();
    if (!p) return;
    if (!p.budgetPlan) p.budgetPlan = emptyBudgetPlan();
    MANUAL_CATEGORIES.forEach((cat) => {
      p.budgetPlan[cat] = Number(formBudgetPlan[cat].value) || 0;
    });
    persist();
    renderCategoryBudgetTable(p);
    toast("비목별 예산 계획이 저장되었습니다");
  });

  function renderExpenseTable(p) {
    const tbody = document.querySelector("#expense-table tbody");
    if (!p.expenses.length) {
      tbody.innerHTML = `<tr><td colspan="5" class="empty-note">지출 내역이 없습니다.</td></tr>`;
      return;
    }
    const sorted = [...p.expenses].sort((a, b) => b.date.localeCompare(a.date));
    tbody.innerHTML = sorted
      .map(
        (ex) => `
      <tr data-expense-id="${ex.id}">
        <td>${fmtDate(ex.date)}</td>
        <td>${escapeHtml(ex.category)}</td>
        <td class="num">${fmtWon(ex.amount)}</td>
        <td>${escapeHtml(ex.memo || "")}</td>
        <td><button class="row-delete" data-del-expense="${ex.id}" title="삭제">✕</button></td>
      </tr>`
      )
      .join("");
  }

  document.getElementById("form-expense").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = getActiveProject();
    if (!p) return;
    const form = e.target;
    p.expenses.push({
      id: uid(),
      date: form.date.value || todayISO(),
      category: form.category.value,
      amount: Number(form.amount.value) || 0,
      memo: form.memo.value.trim(),
    });
    persist();
    renderExpenseTable(p);
    updateBudgetReadout(p);
    renderCategoryBudgetTable(p);
    renderAll();
    form.reset();
    form.date.value = "";
    toast("지출이 추가되었습니다");
  });

  document.querySelector("#expense-table tbody").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del-expense]");
    if (!btn) return;
    const p = getActiveProject();
    if (!p) return;
    p.expenses = p.expenses.filter((ex) => ex.id !== btn.dataset.delExpense);
    persist();
    renderExpenseTable(p);
    updateBudgetReadout(p);
    renderCategoryBudgetTable(p);
    renderAll();
  });

  /* ---------------------------------------------------------------- */
  /* Schedule tab                                                      */
  /* ---------------------------------------------------------------- */

  function renderMilestoneList(p) {
    const el = document.getElementById("milestone-list");
    if (!p.milestones.length) {
      el.innerHTML = `<p class="empty-note">등록된 마일스톤이 없습니다.</p>`;
      return;
    }
    const sorted = [...p.milestones].sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    el.innerHTML = sorted
      .map((m) => {
        const overdue = !m.done && daysBetween(todayISO(), m.dueDate) < 0;
        return `
        <div class="milestone-row${m.done ? " done" : ""}" data-milestone-id="${m.id}">
          <input type="checkbox" ${m.done ? "checked" : ""} data-toggle-milestone="${m.id}" />
          <span class="milestone-title${m.done ? " strike" : ""}">${escapeHtml(m.title)}</span>
          <span class="milestone-due${overdue ? " overdue" : ""}">${fmtDate(m.dueDate)}</span>
          <button class="row-delete" data-del-milestone="${m.id}" title="삭제">✕</button>
        </div>`;
      })
      .join("");
  }

  document.getElementById("form-milestone").addEventListener("submit", (e) => {
    e.preventDefault();
    const p = getActiveProject();
    if (!p) return;
    const form = e.target;
    p.milestones.push({
      id: uid(),
      title: form.title.value.trim(),
      dueDate: form.dueDate.value,
      done: false,
    });
    persist();
    renderMilestoneList(p);
    renderAll();
    form.reset();
    toast("마일스톤이 추가되었습니다");
  });

  document.getElementById("milestone-list").addEventListener("click", (e) => {
    const p = getActiveProject();
    if (!p) return;
    const del = e.target.closest("[data-del-milestone]");
    if (del) {
      p.milestones = p.milestones.filter((m) => m.id !== del.dataset.delMilestone);
      persist();
      renderMilestoneList(p);
      renderAll();
      return;
    }
    const toggle = e.target.closest("[data-toggle-milestone]");
    if (toggle) {
      const m = p.milestones.find((x) => x.id === toggle.dataset.toggleMilestone);
      if (m) m.done = toggle.checked;
      persist();
      renderMilestoneList(p);
      renderAll();
    }
  });

  /* ---------------------------------------------------------------- */
  /* New project                                                       */
  /* ---------------------------------------------------------------- */

  document.getElementById("btn-add-project").addEventListener("click", () => {
    const p = {
      id: uid(),
      name: "새 프로젝트",
      type: "정부지원사업",
      agency: "",
      status: "예정",
      startDate: todayISO(),
      endDate: todayISO(),
      memo: "",
      progress: 0,
      budget: { governmentFund: 0, selfFund: 0 },
      budgetPlan: emptyBudgetPlan(),
      budgetItems: [],
      laborBudget: { cash: 0, inKind: 0 },
      expenses: [],
      milestones: [],
    };
    projects.push(p);
    persist();
    renderAll();
    refreshLaborSelects();
    renderLaborBalanceTable();
    openModal(p.id, "overview");
  });

  /* ---------------------------------------------------------------- */
  /* Filters                                                            */
  /* ---------------------------------------------------------------- */

  ["filter-search", "filter-type", "filter-status"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderProjectGrid);
    document.getElementById(id).addEventListener("change", renderProjectGrid);
  });

  /* ---------------------------------------------------------------- */
  /* Export / Import                                                   */
  /* ---------------------------------------------------------------- */

  document.getElementById("btn-export").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify({ projects, employees, laborEntries }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `사업관리-대시보드-백업-${todayISO()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("JSON 파일로 내보냈습니다");
  });

  document.getElementById("input-import").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        let importedProjects, importedEmployees, importedLabor;
        if (Array.isArray(parsed)) {
          importedProjects = parsed;
          importedEmployees = [];
          importedLabor = [];
        } else if (parsed && Array.isArray(parsed.projects)) {
          importedProjects = parsed.projects;
          importedEmployees = Array.isArray(parsed.employees) ? parsed.employees : [];
          importedLabor = Array.isArray(parsed.laborEntries) ? parsed.laborEntries : [];
        } else {
          throw new Error("invalid format");
        }
        if (!confirm(`${importedProjects.length}개 프로젝트를 가져옵니다. 현재 데이터를 덮어씁니다. 계속할까요?`)) return;
        projects = importedProjects;
        employees = importedEmployees;
        laborEntries = importedLabor;
        persist();
        renderAll();
        refreshLaborSelects();
        renderEmployeeList();
        renderLaborEntries();
        renderLaborPivot();
        toast("데이터를 가져왔습니다");
      } catch (err) {
        alert("파일을 읽을 수 없습니다. 올바른 백업 JSON 파일인지 확인해주세요.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  /* ---------------------------------------------------------------- */
  /* View switcher (dashboard <-> labor cost management)                */
  /* ---------------------------------------------------------------- */

  document.getElementById("view-nav").addEventListener("click", (e) => {
    const btn = e.target.closest(".view-nav-btn");
    if (!btn) return;
    const view = btn.dataset.view;
    document.querySelectorAll(".view-nav-btn").forEach((b) => b.classList.toggle("active", b === btn));
    document.getElementById("view-dashboard").hidden = view !== "dashboard";
    document.getElementById("view-labor").hidden = view !== "labor";
    if (view === "labor") {
      refreshLaborSelects();
      renderEmployeeList();
      renderLaborEntries();
      renderLaborPivot();
    }
  });

  /* ---------------------------------------------------------------- */
  /* Labor cost management: employees                                  */
  /* ---------------------------------------------------------------- */

  function renderEmployeeList() {
    const tbody = document.querySelector("#employee-table tbody");
    if (!employees.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="empty-note">등록된 직원이 없습니다.</td></tr>`;
      return;
    }
    tbody.innerHTML = employees
      .map(
        (emp) => `
      <tr data-employee-id="${emp.id}">
        <td>${escapeHtml(emp.name)}</td>
        <td>${escapeHtml(emp.position || "")}</td>
        <td>${escapeHtml(emp.memo || "")}</td>
        <td><button class="row-delete" data-del-employee="${emp.id}" title="삭제">✕</button></td>
      </tr>`
      )
      .join("");
  }

  document.getElementById("form-employee").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value.trim();
    if (!name) return;
    employees.push({ id: uid(), name, position: form.position.value.trim(), memo: form.memo.value.trim() });
    persist();
    renderEmployeeList();
    refreshLaborSelects();
    form.reset();
    toast("직원이 추가되었습니다");
  });

  document.querySelector("#employee-table tbody").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del-employee]");
    if (!btn) return;
    const emp = employees.find((x) => x.id === btn.dataset.delEmployee);
    if (!emp) return;
    const hasEntries = laborEntries.some((x) => x.employeeId === emp.id);
    const msg = `"${emp.name}" 직원을 삭제할까요?${hasEntries ? " 이 직원의 인건비 집행 내역도 함께 삭제됩니다." : ""}`;
    if (!confirm(msg)) return;
    employees = employees.filter((x) => x.id !== emp.id);
    laborEntries = laborEntries.filter((x) => x.employeeId !== emp.id);
    persist();
    renderEmployeeList();
    renderLaborEntries();
    renderLaborPivot();
    refreshLaborSelects();
    renderAll();
    toast("직원이 삭제되었습니다");
  });

  /* ---------------------------------------------------------------- */
  /* Labor cost management: monthly execution entries                  */
  /* ---------------------------------------------------------------- */

  function refreshLaborSelects() {
    const empSel = document.getElementById("labor-employee-select");
    const projSel = document.getElementById("labor-project-select");
    const prevEmp = empSel.value;
    const prevProj = projSel.value;

    empSel.innerHTML = employees.length
      ? employees.map((e) => `<option value="${e.id}">${escapeHtml(e.name)}${e.position ? ` (${escapeHtml(e.position)})` : ""}</option>`).join("")
      : `<option value="">직원을 먼저 등록하세요</option>`;
    projSel.innerHTML = projects.length
      ? projects.map((p) => `<option value="${p.id}">${escapeHtml(p.name)}</option>`).join("")
      : `<option value="">프로젝트를 먼저 등록하세요</option>`;

    if (employees.some((e) => e.id === prevEmp)) empSel.value = prevEmp;
    if (projects.some((p) => p.id === prevProj)) projSel.value = prevProj;
  }

  document.getElementById("form-labor").addEventListener("submit", (e) => {
    e.preventDefault();
    const form = e.target;
    if (!form.employeeId.value || !form.projectId.value) {
      toast("직원과 프로젝트를 먼저 등록해주세요");
      return;
    }
    laborEntries.push({
      id: uid(),
      employeeId: form.employeeId.value,
      projectId: form.projectId.value,
      month: form.month.value,
      amount: Number(form.amount.value) || 0,
      memo: form.memo.value.trim(),
    });
    persist();
    renderLaborEntries();
    renderLaborPivot();
    renderAll();
    form.reset();
    toast("인건비 집행이 등록되었습니다");
  });

  function renderLaborEntries() {
    const tbody = document.querySelector("#labor-entries-table tbody");
    if (!laborEntries.length) {
      tbody.innerHTML = `<tr><td colspan="6" class="empty-note">등록된 인건비 집행 내역이 없습니다.</td></tr>`;
      return;
    }
    const empById = Object.fromEntries(employees.map((e) => [e.id, e]));
    const projById = Object.fromEntries(projects.map((p) => [p.id, p]));
    const sorted = [...laborEntries].sort((a, b) => b.month.localeCompare(a.month));
    tbody.innerHTML = sorted
      .map((le) => {
        const emp = empById[le.employeeId];
        const proj = projById[le.projectId];
        return `
        <tr data-labor-id="${le.id}">
          <td>${escapeHtml(le.month || "")}</td>
          <td>${escapeHtml(emp ? emp.name : "(삭제된 직원)")}</td>
          <td>${escapeHtml(proj ? proj.name : "(삭제된 프로젝트)")}</td>
          <td class="num">${fmtWon(le.amount)}</td>
          <td>${escapeHtml(le.memo || "")}</td>
          <td><button class="row-delete" data-del-labor="${le.id}" title="삭제">✕</button></td>
        </tr>`;
      })
      .join("");
  }

  document.querySelector("#labor-entries-table tbody").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-del-labor]");
    if (!btn) return;
    laborEntries = laborEntries.filter((x) => x.id !== btn.dataset.delLabor);
    persist();
    renderLaborEntries();
    renderLaborPivot();
    renderAll();
  });

  function renderLaborBalanceTable() {
    const tbody = document.querySelector("#labor-balance-table tbody");
    if (!projects.length) {
      tbody.innerHTML = `<tr><td colspan="7" class="empty-note">등록된 프로젝트가 없습니다.</td></tr>`;
      return;
    }
    tbody.innerHTML = projects
      .map((p) => {
        const lb = p.laborBudget || { cash: 0, inKind: 0 };
        const cashBudget = Number(lb.cash) || 0;
        const inKindBudget = Number(lb.inKind) || 0;
        const executed = laborSpentForProject(p);
        const govSpent = Math.min(executed, Number(p.budget.governmentFund) || 0);
        const selfCashSpent = executed - govSpent;
        const cashRemaining = cashBudget - executed;
        return `
        <tr data-labor-balance-row="${p.id}">
          <td>${escapeHtml(p.name)}</td>
          <td><input type="number" class="input" style="width:120px;" min="0" step="10" data-labor-budget="cash" data-project-id="${p.id}" value="${cashBudget}" /></td>
          <td><input type="number" class="input" style="width:120px;" min="0" step="10" data-labor-budget="inKind" data-project-id="${p.id}" value="${inKindBudget}" /></td>
          <td class="num">${fmtWon(govSpent)}</td>
          <td class="num">${fmtWon(selfCashSpent)}</td>
          <td class="num" style="${cashRemaining < 0 ? "color:var(--critical); font-weight:700;" : ""}">${fmtWon(cashRemaining)}</td>
          <td class="num">${fmtWon(inKindBudget)}</td>
        </tr>`;
      })
      .join("");
  }

  document.querySelector("#labor-balance-table tbody").addEventListener("change", (e) => {
    const input = e.target.closest("[data-labor-budget]");
    if (!input) return;
    const p = projects.find((x) => x.id === input.dataset.projectId);
    if (!p) return;
    if (!p.laborBudget) p.laborBudget = { cash: 0, inKind: 0 };
    const field = input.dataset.laborBudget;
    p.laborBudget[field] = Number(input.value) || 0;
    persist();
    renderLaborBalanceTable();
    renderAll();
  });

  function renderLaborPivot() {
    renderLaborBalanceTable();
    const el = document.getElementById("labor-pivot-table");
    if (!laborEntries.length) {
      el.innerHTML = `<tbody><tr><td class="empty-note">등록된 인건비 집행 내역이 없습니다.</td></tr></tbody>`;
      return;
    }
    const projById = Object.fromEntries(projects.map((p) => [p.id, p]));
    const months = [...new Set(laborEntries.map((e) => e.month))].sort();
    const projectIds = [...new Set(laborEntries.map((e) => e.projectId))];
    const cols = projectIds.map((id) => ({ id, name: projById[id] ? projById[id].name : "(삭제된 프로젝트)" }));

    const cellSum = (month, projectId) =>
      laborEntries
        .filter((e) => e.month === month && e.projectId === projectId)
        .reduce((s, e) => s + (Number(e.amount) || 0), 0);

    const bodyRows = months
      .map((month) => {
        const cells = cols.map((c) => cellSum(month, c.id));
        const rowTotal = cells.reduce((a, b) => a + b, 0);
        return `<tr><td>${month}</td>${cells.map((v) => `<td class="num">${v ? fmtWon(v) : "-"}</td>`).join("")}<td class="num"><strong>${fmtWon(rowTotal)}</strong></td></tr>`;
      })
      .join("");

    const colTotals = cols.map((c) => months.reduce((s, m) => s + cellSum(m, c.id), 0));
    const grandTotal = colTotals.reduce((a, b) => a + b, 0);

    el.innerHTML = `
      <thead>
        <tr><th>월</th>${cols.map((c) => `<th>${escapeHtml(c.name)}</th>`).join("")}<th>합계</th></tr>
      </thead>
      <tbody>${bodyRows}</tbody>
      <tfoot>
        <tr><td><strong>합계</strong></td>${colTotals.map((v) => `<td class="num"><strong>${fmtWon(v)}</strong></td>`).join("")}<td class="num"><strong>${fmtWon(grandTotal)}</strong></td></tr>
      </tfoot>
    `;
  }

  /* ---------------------------------------------------------------- */
  /* Theme toggle                                                       */
  /* ---------------------------------------------------------------- */

  function applyTheme(theme) {
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
  }

  const savedTheme = localStorage.getItem(THEME_KEY);
  applyTheme(savedTheme);

  document.getElementById("btn-theme").addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const currentlyDark = current ? current === "dark" : prefersDark;
    const next = currentlyDark ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem(THEME_KEY, next);
  });

  /* ---------------------------------------------------------------- */
  /* Init                                                               */
  /* ---------------------------------------------------------------- */

  renderAll();
  refreshLaborSelects();
  renderEmployeeList();
  renderLaborEntries();
  renderLaborPivot();
})();
