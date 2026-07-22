(() => {
  "use strict";

  const STORAGE_KEY = "biz-dashboard-data-v1";
  const THEME_KEY = "biz-dashboard-theme";

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

  function seedData() {
    const P = (o) => ({
      id: uid(),
      memo: "",
      progress: 0,
      budget: { governmentFund: 0, selfFund: 0 },
      expenses: [],
      milestones: [],
      ...o,
    });
    const E = (date, category, amount, memo) => ({ id: uid(), date, category, amount, memo });
    const M = (title, dueDate, done = false) => ({ id: uid(), title, dueDate, done });

    return [
      P({
        name: "2026년 중소기업 기술혁신개발사업",
        type: "정부지원사업",
        agency: "중소벤처기업부",
        status: "진행중",
        startDate: "2026-03-01",
        endDate: "2027-02-28",
        memo: "AI 기반 품질검사 솔루션 개발 과제",
        progress: 45,
        budget: { governmentFund: 300000000, selfFund: 100000000 },
        expenses: [
          E("2026-03-15", "인건비", 25000000, "연구원 3인 인건비 (3월)"),
          E("2026-04-10", "재료비", 12000000, "시제품 부품 구매"),
          E("2026-05-20", "외주비", 30000000, "알고리즘 개발 외주"),
          E("2026-06-25", "인건비", 25000000, "연구원 3인 인건비 (6월)"),
        ],
        milestones: [
          M("협약 체결", "2026-03-01", true),
          M("1차 진도점검 보고", "2026-06-30", true),
          M("중간보고서 제출", "2026-08-31"),
          M("시제품 제작 완료", "2026-11-30"),
          M("최종보고서 및 정산", "2027-02-28"),
        ],
      }),
      P({
        name: "스마트공장 구축 지원사업",
        type: "정부지원사업",
        agency: "스마트제조혁신추진단",
        status: "진행중",
        startDate: "2026-01-15",
        endDate: "2026-09-30",
        memo: "생산라인 MES 고도화",
        progress: 70,
        budget: { governmentFund: 150000000, selfFund: 150000000 },
        expenses: [
          E("2026-02-01", "장비비", 80000000, "IoT 센서 및 게이트웨이"),
          E("2026-04-15", "외주비", 60000000, "MES 시스템 구축 용역"),
          E("2026-06-10", "재료비", 45000000, "설비 배선 자재"),
        ],
        milestones: [
          M("착수보고", "2026-01-31", true),
          M("현장 설비 설치 완료", "2026-05-31", true),
          M("시운전", "2026-07-15", true),
          M("완료보고 및 정산", "2026-09-30"),
        ],
      }),
      P({
        name: "수출바우처 지원사업",
        type: "정부지원사업",
        agency: "중소기업진흥공단",
        status: "진행중",
        startDate: "2026-02-01",
        endDate: "2026-08-15",
        memo: "해외 인증 및 마케팅 바우처 활용",
        progress: 55,
        budget: { governmentFund: 60000000, selfFund: 20000000 },
        expenses: [
          E("2026-03-05", "외주비", 18000000, "해외 인증(CE) 취득 비용"),
          E("2026-05-12", "여비", 6000000, "해외 전시회 출장"),
          E("2026-06-20", "기타", 9000000, "카탈로그 및 마케팅 제작"),
        ],
        milestones: [
          M("바우처 발급", "2026-02-15", true),
          M("해외 인증 취득", "2026-06-30", true),
          M("해외 전시회 참가", "2026-07-20"),
          M("실적 정산보고", "2026-08-15"),
        ],
      }),
      P({
        name: "사내 ERP 시스템 고도화",
        type: "자체사업",
        agency: "",
        status: "진행중",
        startDate: "2026-04-01",
        endDate: "2026-10-31",
        memo: "회계/재고 모듈 통합 및 자동화",
        progress: 30,
        budget: { governmentFund: 0, selfFund: 80000000 },
        expenses: [
          E("2026-04-20", "외주비", 20000000, "ERP 커스터마이징 1차"),
          E("2026-06-05", "인건비", 8000000, "내부 TF 운영비"),
        ],
        milestones: [
          M("요구사항 정의 완료", "2026-04-30", true),
          M("1차 개발 완료", "2026-07-31"),
          M("전사 오픈", "2026-10-15"),
        ],
      }),
      P({
        name: "신제품 브랜드 리뉴얼",
        type: "자체사업",
        agency: "",
        status: "예정",
        startDate: "2026-09-01",
        endDate: "2027-01-31",
        memo: "패키지 디자인 및 브랜드 아이덴티티 개편",
        progress: 0,
        budget: { governmentFund: 0, selfFund: 45000000 },
        expenses: [],
        milestones: [
          M("디자인 에이전시 선정", "2026-09-15"),
          M("패키지 시안 확정", "2026-11-30"),
          M("신규 패키지 출시", "2027-01-31"),
        ],
      }),
      P({
        name: "청년창업사관학교 후속 지원사업",
        type: "정부지원사업",
        agency: "창업진흥원",
        status: "진행중",
        startDate: "2025-09-01",
        endDate: "2026-08-31",
        memo: "졸업기업 후속 성장 지원",
        progress: 82,
        budget: { governmentFund: 70000000, selfFund: 30000000 },
        expenses: [
          E("2025-10-10", "재료비", 15000000, "시제품 고도화 재료"),
          E("2026-01-15", "외주비", 25000000, "판로 개척 컨설팅"),
          E("2026-04-20", "인건비", 20000000, "전담 인력 인건비"),
          E("2026-06-30", "기타", 8000000, "IR 자료 제작"),
        ],
        milestones: [
          M("사업계획 확정", "2025-09-30", true),
          M("중간평가", "2026-02-28", true),
          M("투자 유치 IR", "2026-06-30", true),
          M("최종성과보고", "2026-08-31"),
        ],
      }),
    ];
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
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

  let projects = load();
  let activeProjectId = null;
  let activeTab = "overview";

  const persist = () => save(projects);

  /* ---------------------------------------------------------------- */
  /* Derived calculations                                              */
  /* ---------------------------------------------------------------- */

  function budgetTotal(p) {
    return (p.budget.governmentFund || 0) + (p.budget.selfFund || 0);
  }
  function spentAmount(p) {
    return p.expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
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
    persist();
    closeModal();
    renderAll();
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
      expenses: [],
      milestones: [],
    };
    projects.push(p);
    persist();
    renderAll();
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
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
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
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("invalid format");
        if (!confirm(`${data.length}개 프로젝트를 가져옵니다. 현재 데이터를 덮어씁니다. 계속할까요?`)) return;
        projects = data;
        persist();
        renderAll();
        toast("데이터를 가져왔습니다");
      } catch (err) {
        alert("파일을 읽을 수 없습니다. 올바른 백업 JSON 파일인지 확인해주세요.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

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
})();
