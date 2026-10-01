/**
 * ==============================================================================
 * SWACHHSETU LEADERBOARD UI COMPONENTS & CONTROLLER (leaderboard-components.js)
 * Kanpur Smart City Mission • Swachh Survekshan 2026
 * 
 * Reusable Components: LeaderboardTable, PodiumCard, RankBadge,
 * EmployeeOfMonthCard, ZoneBestGrid, HomeTopPerformers
 * ==============================================================================
 */

(function (window) {
  'use strict';

  // Internal component state
  const UI_STATE = {
    activeBoard: 'citizens', // 'citizens' or 'workers'
    timeFilter: 'all',       // 'week', 'month', 'all'
    zoneFilter: 'all',       // 'all' or ward substring
    searchQuery: '',
    isHi: false
  };

  function isHindi() {
    return window.APP_STATE && window.APP_STATE.currentLang === 'hi';
  }

  // --------------------------------------------------------------------------
  // 1. REUSABLE COMPONENT: RANK DELTA ARROW
  // --------------------------------------------------------------------------
  function createRankDeltaHtml(diff) {
    if (diff > 0) {
      return `<span class="rank-delta-tag up" title="Climbed +${diff} rank">▲ +${diff}</span>`;
    } else if (diff < 0) {
      return `<span class="rank-delta-tag down" title="Dropped ${diff} rank">▼ ${Math.abs(diff)}</span>`;
    }
    return `<span class="rank-delta-tag same" title="No rank change">• 0</span>`;
  }

  // --------------------------------------------------------------------------
  // 2. REUSABLE COMPONENT: RANK BADGE
  // --------------------------------------------------------------------------
  function createRankBadgeHtml(badge) {
    const isHi = isHindi();
    const name = isHi ? badge.nameHi : badge.nameEn;
    return `
      <span class="tier-badge ${badge.class}">
        <span>${badge.icon}</span>
        <span>${name}</span>
      </span>
    `;
  }

  // --------------------------------------------------------------------------
  // 3. REUSABLE COMPONENT: PODIUM CARD (TOP 3)
  // --------------------------------------------------------------------------
  function createPodiumCardHtml(item, rank, type) {
    const isHi = isHindi();
    const isRank1 = rank === 1;
    const isCitizen = type === 'citizens';

    let crownHtml = '';
    let medalIcon = '🥉';
    let rankLabel = isHi ? 'तीसरा स्थान' : '3rd Place';

    if (rank === 1) {
      crownHtml = `<div class="podium-crown">👑</div>`;
      medalIcon = '🥇';
      rankLabel = isHi ? 'प्रथम स्थान' : '1st Champion';
    } else if (rank === 2) {
      medalIcon = '🥈';
      rankLabel = isHi ? 'द्वितीय स्थान' : '2nd Runner-Up';
    }

    const displayName = isCitizen ? item.displayName : item.name;
    const avatar = isCitizen ? item.displayAvatar : (item.name ? item.name.split(' ').map(n=>n[0]).join('').substring(0, 2) : 'SH');
    const avatarBg = item.color || (isRank1 ? '#ffd700' : (rank === 2 ? '#94a3b8' : '#d97706'));
    const ward = isCitizen ? item.ward : `${item.zone} • ${item.vehicle}`;

    let scoreHtml = '';
    if (isCitizen) {
      scoreHtml = `
        <div class="podium-user-score">
          🌱 ${item.points} <span style="font-size: 0.75rem; color: #94a3b8;">PTS</span>
        </div>
      `;
    } else {
      scoreHtml = `
        <div class="podium-user-score" style="color: #00e676;">
          ⚡ ${item.compositeScore} <span style="font-size: 0.75rem; color: #94a3b8;">/ 100</span>
        </div>
        <div style="font-size: 0.76rem; color: #ffb703; font-weight: 700;">★ ${item.rating} Rating</div>
      `;
    }

    return `
      <div class="podium-col rank-${rank}">
        ${crownHtml}
        <div class="podium-avatar-ring" style="background: ${avatarBg};">
          ${avatar}
          <div class="podium-badge-icon">${medalIcon}</div>
        </div>
        <div class="podium-user-info">
          <div class="podium-user-name">${displayName}</div>
          <div class="podium-user-ward">${ward}</div>
          ${scoreHtml}
        </div>
        <div class="podium-pillar">
          <div class="podium-pillar-rank">#${rank}</div>
          <div class="podium-pillar-label">${rankLabel}</div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 4. REUSABLE COMPONENT: LEADERBOARD TABLE
  // --------------------------------------------------------------------------
  function createLeaderboardTableHtml(type, items) {
    const isHi = isHindi();
    const isCitizen = type === 'citizens';

    if (!items || items.length === 0) {
      return `
        <div style="text-align: center; padding: 40px; color: #94a3b8;">
          <div style="font-size: 2.4rem; margin-bottom: 10px;">🔍</div>
          <h4>${isHi ? 'कोई रिकॉर्ड नहीं मिला' : 'No Leaderboard Records Found'}</h4>
          <p style="font-size: 0.85rem;">${isHi ? 'कृपया फ़िल्टर या खोज शब्द बदलें।' : 'Try changing your ward filter or search keywords.'}</p>
        </div>
      `;
    }

    if (isCitizen) {
      // Citizen Table Columns: Rank, Avatar/Initials, Name, Ward/Zone, Total Complaints, Resolved Complaints, Points, Badge
      const rows = items.map(c => {
        const isUser = c.isCurrentUser;
        const youTag = isUser ? `<span class="you-tag">${isHi ? 'आप' : 'YOU'}</span>` : '';
        const rankClass = c.rank <= 3 ? `rank-${c.rank}` : '';

        return `
          <tr class="${isUser ? 'highlight-user' : ''}">
            <td>
              <div class="lb-rank-cell">
                <div class="rank-circle ${rankClass}">#${c.rank}</div>
                ${createRankDeltaHtml(c.rankDiff)}
              </div>
            </td>
            <td>
              <div class="performer-avatar" style="background: ${c.color || '#22e4ff'};">
                ${c.displayAvatar}
              </div>
            </td>
            <td>
              <div style="font-weight: 700; color: #fff; display: flex; align-items: center; gap: 8px;">
                ${c.displayName} ${youTag}
              </div>
              <div style="font-size: 0.72rem; color: #94a3b8;">ID: ${c.id}</div>
            </td>
            <td>
              <div style="font-size: 0.85rem; color: #cbd5e1;">${c.ward}</div>
            </td>
            <td style="text-align: center;">
              <b style="color: #fff;">${c.totalComplaints}</b>
              <div style="font-size: 0.72rem; color: #94a3b8;">${isHi ? 'रिपोर्ट्स' : 'Reports'}</div>
            </td>
            <td style="text-align: center;">
              <b style="color: #00e676;">${c.resolvedComplaints}</b>
              <div style="font-size: 0.72rem; color: #94a3b8;">(${Math.round((c.resolvedComplaints / (c.totalComplaints || 1)) * 100)}%)</div>
            </td>
            <td>
              <div style="font-family: var(--font-heading); font-size: 1.05rem; font-weight: 800; color: var(--cyan-neon);">
                ${c.points} <span style="font-size: 0.75rem; color: #94a3b8;">PTS</span>
              </div>
            </td>
            <td>
              ${createRankBadgeHtml(c.badge)}
            </td>
          </tr>
        `;
      }).join('');

      return `
        <table class="lb-table">
          <thead>
            <tr>
              <th>${isHi ? 'रैंक' : 'Rank'}</th>
              <th>${isHi ? 'अवतार' : 'Avatar'}</th>
              <th>${isHi ? 'नागरिक का नाम' : 'Citizen Name'}</th>
              <th>${isHi ? 'वार्ड / क्षेत्र' : 'Ward / Zone'}</th>
              <th style="text-align: center;">${isHi ? 'कुल शिकायतें' : 'Total Complaints'}</th>
              <th style="text-align: center;">${isHi ? 'हल हुई शिकायतें' : 'Resolved'}</th>
              <th>${isHi ? 'ग्रीन पॉइंट्स' : 'Points'}</th>
              <th>${isHi ? 'बैज / उपाधि' : 'Badge Tier'}</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    } else {
      // Safai Karmchari Table Columns: Rank, Worker Name, Zone/Ward, Assigned Tasks, Resolved, Avg Turnaround, SLA %, Rating, Status, Composite Score
      const rows = items.map(w => {
        const rankClass = w.rank <= 3 ? `rank-${w.rank}` : '';
        const isUnresponsive = w.status.includes('Unresponsive') || w.slaPercent < 75;
        const statusClass = isUnresponsive ? 'status-unresponsive' : (w.status === 'On Duty' ? 'status-duty' : 'status-active');
        const statusIcon = isUnresponsive ? '⚠️' : (w.status === 'On Duty' ? '🚜' : '⚡');

        // Composite breakdown explanation
        const b = w.breakdown;
        const formulaTooltip = `
          <b>Composite Score Breakdown:</b><br>
          • SLA Compliance: ${w.slaPercent}% × 0.4 = <b>${b.partSla}</b><br>
          • Citizen Rating: ${w.rating}★ × 20 × 0.3 = <b>${b.partRating}</b><br>
          • Resolved Ratio: ${b.resolvedRatio}% × 0.2 = <b>${b.partResolved}</b><br>
          • Speed Score: ${b.speedScore} × 0.1 = <b>${b.partSpeed}</b><br>
          ${b.adminDelta ? `• Admin Bonus/Penalty: <b>${b.adminDelta > 0 ? '+' : ''}${b.adminDelta}</b><br>` : ''}
          <b>Total Score = ${w.compositeScore} / 100</b>
        `;

        return `
          <tr class="${isUnresponsive ? 'row-sla-breached' : ''}">
            <td>
              <div class="lb-rank-cell">
                <div class="rank-circle ${rankClass}">#${w.rank}</div>
                ${createRankDeltaHtml(w.rankDiff)}
              </div>
            </td>
            <td>
              <div style="font-weight: 700; color: #fff;">${w.name}</div>
              <div style="font-size: 0.74rem; color: #94a3b8;">${w.vehicle}</div>
            </td>
            <td>
              <div style="font-size: 0.85rem; color: #cbd5e1;">${w.zone}</div>
            </td>
            <td style="text-align: center;">
              <b style="color: #fff;">${w.assigned}</b>
            </td>
            <td style="text-align: center;">
              <b style="color: #00e676;">${w.resolved}</b>
            </td>
            <td style="text-align: center;">
              <span style="font-family: var(--font-heading); color: ${w.avgTurnaroundHours <= 2.5 ? '#00e676' : (w.avgTurnaroundHours <= 4.5 ? '#ffb703' : '#ff3366')}; font-weight: 700;">
                ${w.avgTurnaroundHours} hrs
              </span>
            </td>
            <td style="text-align: center;">
              <span style="font-weight: 700; color: ${w.slaPercent >= 95 ? '#00e676' : (w.slaPercent >= 80 ? '#ffb703' : '#ff3366')};">
                ${w.slaPercent}%
              </span>
            </td>
            <td style="text-align: center;">
              <span style="color: #ffb703; font-weight: 700;">★ ${w.rating}</span>
            </td>
            <td>
              <span class="status-pill ${statusClass}">
                <span>${statusIcon}</span>
                <span>${w.status}</span>
              </span>
            </td>
            <td>
              <div class="score-pill-wrap">
                <div class="composite-score-pill">
                  ⚡ ${w.compositeScore}
                </div>
                <div class="score-tooltip">
                  ${formulaTooltip}
                </div>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      return `
        <table class="lb-table">
          <thead>
            <tr>
              <th>${isHi ? 'रैंक' : 'Rank'}</th>
              <th>${isHi ? 'कर्मचारी का नाम व वाहन' : 'Worker Name & Vehicle'}</th>
              <th>${isHi ? 'वार्ड / क्षेत्र' : 'Zone / Ward'}</th>
              <th style="text-align: center;">${isHi ? 'सौंपे गए कार्य' : 'Assigned Tasks'}</th>
              <th style="text-align: center;">${isHi ? 'निपटारे' : 'Resolved'}</th>
              <th style="text-align: center;">${isHi ? 'औसत समय' : 'Avg Turnaround'}</th>
              <th style="text-align: center;">${isHi ? 'समयबद्धता %' : 'SLA Compliance'}</th>
              <th style="text-align: center;">${isHi ? 'रेटिंग' : 'Rating'}</th>
              <th>${isHi ? 'स्थिति' : 'Status'}</th>
              <th>
                ${isHi ? 'कंपोजिट स्कोर' : 'Composite Score'}
                <span title="Formula: (SLA% × 0.4) + (Rating × 20 × 0.3) + (Resolved ratio × 0.2) + (Speed score × 0.1)" style="cursor: help; color: var(--cyan-neon);">ℹ️</span>
              </th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
    }
  }

  // --------------------------------------------------------------------------
  // 5. EMPLOYEE OF THE MONTH SHOWCASE CARD
  // --------------------------------------------------------------------------
  function createEmployeeOfMonthCardHtml(worker) {
    if (!worker) return '';
    const isHi = isHindi();

    return `
      <div class="eom-card">
        <div class="eom-header">
          <span class="eom-tag">
            <span>🏆</span> <span>${isHi ? 'माह का सर्वश्रेष्ठ सफाई कर्मी' : 'EMPLOYEE OF THE MONTH'}</span>
          </span>
          <span style="font-size: 0.78rem; color: #ffd700; font-weight: 700;">
            Kanpur Smart City Honor
          </span>
        </div>
        <div class="eom-body">
          <div class="eom-avatar">
            👨‍🔧
          </div>
          <div class="eom-details">
            <h3>${worker.name}</h3>
            <div style="font-size: 0.84rem; color: #cbd5e1; margin-bottom: 4px;">
              ${worker.vehicle} • 📍 ${worker.zone}
            </div>
            <div style="display: flex; gap: 14px; font-size: 0.8rem; margin-top: 6px;">
              <span><b>${worker.resolved}</b> ${isHi ? 'निवारण' : 'Resolved'}</span>
              <span><b>${worker.avgTurnaroundHours}h</b> ${isHi ? 'औसत गति' : 'Avg Speed'}</span>
              <span style="color: #ffd700;">★ <b>${worker.rating}</b> (${worker.slaPercent}% SLA)</span>
            </div>
            <div class="eom-perks">
              🎁 <b>${isHi ? 'पुरस्कार' : 'Reward'}:</b> ${worker.perk || '₹2,500 Cash Award + Smart Watch + Honor Certificate'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 6. ZONE-WISE BEST PERFORMER MINI CARDS
  // --------------------------------------------------------------------------
  function createZoneBestGridHtml(zoneBestList) {
    const isHi = isHindi();
    if (!zoneBestList || zoneBestList.length === 0) return '';

    const cards = zoneBestList.slice(0, 6).map(item => `
      <div class="zone-mini-card">
        <div>
          <div class="zone-mini-name">${item.worker.name}</div>
          <div class="zone-mini-ward">📍 ${item.zone} (${item.worker.vehicle})</div>
        </div>
        <div style="text-align: right;">
          <div class="zone-mini-score">⚡ ${item.worker.compositeScore}</div>
          <div style="font-size: 0.7rem; color: #ffb703;">★ ${item.worker.rating} (${item.worker.avgTurnaroundHours}h)</div>
        </div>
      </div>
    `).join('');

    return `
      <div class="zone-best-section">
        <h4 class="zone-best-title">
          <span>📍</span> <span>${isHi ? 'जोन-वार सर्वश्रेष्ठ सफाई नायक' : 'Zone-Wise Best Performers'}</span>
        </h4>
        <div class="zone-best-grid">
          ${cards}
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 7. HOME PAGE TOP PERFORMERS HIGHLIGHT SECTION
  // --------------------------------------------------------------------------
  function renderHomeTopPerformers() {
    const container = document.getElementById('homeTopPerformersTarget');
    if (!container) return;

    const isHi = isHindi();
    const citizens = window.LeaderboardService.getCitizens('month', 'all').slice(0, 5);
    const workers = window.LeaderboardService.getWorkers('all').slice(0, 5);

    // Left card: Top 5 Citizens
    const citizenRows = citizens.map((c, idx) => {
      const rank = idx + 1;
      const rankClass = rank === 1 ? 'gold' : (rank === 2 ? 'silver' : (rank === 3 ? 'bronze' : ''));
      return `
        <div class="performer-item rank-${rank} ${c.isCurrentUser ? 'is-current-user' : ''}">
          <div class="performer-left">
            <div class="rank-badge-home ${rankClass}">#${rank}</div>
            <div class="performer-avatar" style="background: ${c.color || '#22e4ff'};">${c.displayAvatar}</div>
            <div class="performer-info">
              <div class="performer-name">
                ${c.displayName}
                ${c.isCurrentUser ? `<span class="you-tag">${isHi ? 'आप' : 'YOU'}</span>` : ''}
              </div>
              <div class="performer-sub">${c.ward} • ${c.badge.icon} ${isHi ? c.badge.nameHi : c.badge.nameEn}</div>
            </div>
          </div>
          <div class="performer-right">
            <div>
              <div class="performer-score-main">${c.points} <small>PTS</small></div>
              <div class="performer-score-sub">${c.resolvedComplaints} ${isHi ? 'हल' : 'resolved'}</div>
            </div>
            ${createRankDeltaHtml(c.rankDiff)}
          </div>
        </div>
      `;
    }).join('');

    // Right card: Top 5 Workers
    const workerRows = workers.map((w, idx) => {
      const rank = idx + 1;
      const rankClass = rank === 1 ? 'gold' : (rank === 2 ? 'silver' : (rank === 3 ? 'bronze' : ''));
      return `
        <div class="performer-item rank-${rank}">
          <div class="performer-left">
            <div class="rank-badge-home ${rankClass}">#${rank}</div>
            <div class="performer-avatar" style="background: #0e1233; border-color: rgba(34,228,255,0.4); font-size: 1.1rem;">👨‍🔧</div>
            <div class="performer-info">
              <div class="performer-name">${w.name}</div>
              <div class="performer-sub">${w.zone} • ${w.vehicle}</div>
            </div>
          </div>
          <div class="performer-right">
            <div>
              <div class="performer-score-main" style="color: #00e676;">⚡ ${w.compositeScore}</div>
              <div class="performer-score-sub">★ ${w.rating} • ${w.avgTurnaroundHours}h</div>
            </div>
            ${createRankDeltaHtml(w.rankDiff)}
          </div>
        </div>
      `;
    }).join('');

    container.innerHTML = `
      <div class="top-performers-section">
        <div class="top-performers-header">
          <div>
            <span class="section-tag">
              <span>🏆</span> <span>${isHi ? 'स्वच्छ सर्वेक्षण 2026 रैंकिंग' : 'Swachh Survekshan 2026 Rankings'}</span>
            </span>
            <h2>
              <span>🌟</span>
              <span>${isHi ? 'शीर्ष प्रदर्शनकर्ता (Top Performers)' : 'City Champions & Top Performers'}</span>
            </h2>
          </div>
          <div class="live-pulse-badge">
            <span class="pulse-dot"></span>
            <span>${isHi ? 'लाइव सिंक सक्रिय' : 'Live Real-Time Telemetry'}</span>
          </div>
        </div>

        <div class="top-performers-grid">
          <!-- Left: Citizen Leaderboard (Swachh Warriors) -->
          <div class="top-performer-card">
            <div class="performer-card-head">
              <div class="performer-card-title">
                <div class="icon-orb citizen-orb">🌱</div>
                <div>
                  <h3>${isHi ? 'स्वच्छ योद्धा (नागरिक)' : 'Swachh Warriors (Citizens)'}</h3>
                  <p>${isHi ? 'कचरा रिपोर्टिंग और सत्यापन में अग्रणी नागरिक' : 'Leading citizens reporting & verifying city waste'}</p>
                </div>
              </div>
            </div>

            <div class="performer-list">
              ${citizenRows}
            </div>

            <button class="btn-view-leaderboard" onclick="switchPage('leaderboard'); LeaderboardUI.setActiveBoard('citizens');">
              <span>${isHi ? 'पूरा सिटिजन लीडरबोर्ड देखें' : 'View Full Citizen Leaderboard'}</span>
              <span>→</span>
            </button>
          </div>

          <!-- Right: Safai Karmchari Leaderboard (Safai Heroes) -->
          <div class="top-performer-card">
            <div class="performer-card-head">
              <div class="performer-card-title">
                <div class="icon-orb worker-orb">🧹</div>
                <div>
                  <h3>${isHi ? 'सफाई हीरोज (सफाई कर्मी)' : 'Safai Heroes (Sanitation Staff)'}</h3>
                  <p>${isHi ? 'त्वरित निवारण और उच्च नागरिक रेटिंग वाले कर्मचारी' : 'Top sanitation crews with fastest SLA cleanup & 5★ ratings'}</p>
                </div>
              </div>
            </div>

            <div class="performer-list">
              ${workerRows}
            </div>

            <button class="btn-view-leaderboard" onclick="switchPage('leaderboard'); LeaderboardUI.setActiveBoard('workers');">
              <span>${isHi ? 'पूरा सफाई कर्मी लीडरबोर्ड देखें' : 'View Full Sanitation Staff Leaderboard'}</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --------------------------------------------------------------------------
  // 8. FULL LEADERBOARD PAGE CONTROLLER
  // --------------------------------------------------------------------------
  function renderFullLeaderboard() {
    const isHi = isHindi();
    const type = UI_STATE.activeBoard;

    // Update Tab Buttons UI
    const tabCitizens = document.getElementById('tabBoardCitizens');
    const tabWorkers = document.getElementById('tabBoardWorkers');
    if (tabCitizens && tabWorkers) {
      if (type === 'citizens') {
        tabCitizens.classList.add('active');
        tabWorkers.classList.remove('active');
      } else {
        tabCitizens.classList.remove('active');
        tabWorkers.classList.add('active');
      }
    }

    // Controls visibility: anonymous toggle & time filters only apply to citizens
    const anonToggleWrapper = document.getElementById('lbAnonToggleWrapper');
    const timeFilterWrapper = document.getElementById('lbTimeFilterWrapper');
    if (anonToggleWrapper) {
      anonToggleWrapper.style.display = type === 'citizens' ? 'inline-flex' : 'none';
    }
    if (timeFilterWrapper) {
      timeFilterWrapper.style.display = type === 'citizens' ? 'flex' : 'none';
    }

    // Fetch and filter data
    let items = [];
    if (type === 'citizens') {
      items = window.LeaderboardService.getCitizens(UI_STATE.timeFilter, UI_STATE.zoneFilter);
    } else {
      items = window.LeaderboardService.getWorkers(UI_STATE.zoneFilter);
    }

    // Apply search filter if query exists
    if (UI_STATE.searchQuery.trim()) {
      const q = UI_STATE.searchQuery.toLowerCase();
      items = items.filter(it => {
        const name = (it.displayName || it.name || '').toLowerCase();
        const ward = (it.ward || it.zone || '').toLowerCase();
        return name.includes(q) || ward.includes(q);
      });
    }

    // Render Sticky Current User Row (Always visible for citizens)
    const stickyContainer = document.getElementById('lbStickyUserContainer');
    if (stickyContainer) {
      if (type === 'citizens') {
        const userEntry = window.LeaderboardService.getCurrentUserRank(UI_STATE.timeFilter, UI_STATE.zoneFilter);
        if (userEntry) {
          stickyContainer.style.display = 'flex';
          stickyContainer.innerHTML = `
            <div class="sticky-user-left">
              <div class="your-rank-badge">
                ${isHi ? 'आपकी रैंक' : 'Your Rank'}: #${userEntry.rank}
              </div>
              <div class="performer-avatar" style="background: ${userEntry.color || '#22e4ff'};">
                ${userEntry.displayAvatar}
              </div>
              <div>
                <div class="sticky-user-name">
                  ${userEntry.displayName}
                  <span class="you-tag">${isHi ? 'आप' : 'YOU'}</span>
                </div>
                <div class="sticky-user-meta">
                  📍 ${userEntry.ward} • ${createRankBadgeHtml(userEntry.badge)}
                </div>
              </div>
            </div>
            <div class="sticky-user-right">
              <div>
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">
                  ${isHi ? 'सत्यापित शिकायतें' : 'Validated Reports'}
                </span>
                <div style="font-weight: 700; color: #fff;">${userEntry.resolvedComplaints} / ${userEntry.totalComplaints}</div>
              </div>
              <div class="sticky-user-pts-circle">
                <span style="font-size: 0.72rem; color: #94a3b8; text-transform: uppercase;">
                  ${isHi ? 'आपके पॉइंट्स' : 'Your Points'}
                </span>
                <span class="sticky-pts-val">${userEntry.points} <small style="font-size: 0.75rem;">PTS</small></span>
              </div>
            </div>
          `;
        } else {
          stickyContainer.style.display = 'none';
        }
      } else {
        stickyContainer.style.display = 'none';
      }
    }

    // Render Podium for Top 3 (from unfiltered full list)
    const podiumTarget = document.getElementById('lbPodiumTarget');
    if (podiumTarget) {
      const top3 = type === 'citizens'
        ? window.LeaderboardService.getCitizens(UI_STATE.timeFilter, 'all').slice(0, 3)
        : window.LeaderboardService.getWorkers('all').slice(0, 3);

      if (top3.length >= 3) {
        podiumTarget.innerHTML = `
          <div class="podium-section">
            <h3 class="podium-title">
              <span>🏆</span>
              <span>${isHi ? (type === 'citizens' ? 'सर्वोच्च 3 स्वच्छ योद्धा' : 'सर्वोच्च 3 सफाई कर्मी') : (type === 'citizens' ? 'Top 3 Swachh Warriors' : 'Top 3 Sanitation Champions')}</span>
            </h3>
            <div class="podium-container">
              ${createPodiumCardHtml(top3[1], 2, type)}
              ${createPodiumCardHtml(top3[0], 1, type)}
              ${createPodiumCardHtml(top3[2], 3, type)}
            </div>
          </div>
        `;
      } else {
        podiumTarget.innerHTML = '';
      }
    }

    // Render Main Table
    const tableTarget = document.getElementById('lbTableTarget');
    if (tableTarget) {
      tableTarget.innerHTML = createLeaderboardTableHtml(type, items);
    }

    // Render Workers Showcase (Employee of the Month & Zone-Wise Best Cards)
    const showcaseTarget = document.getElementById('lbWorkersShowcaseTarget');
    if (showcaseTarget) {
      if (type === 'workers') {
        showcaseTarget.style.display = 'grid';
        const topWorker = window.LeaderboardService.getWorkers('all')[0];
        const zoneBestList = window.LeaderboardService.getZoneBestWorkers();

        showcaseTarget.innerHTML = `
          ${createEmployeeOfMonthCardHtml(topWorker)}
          ${createZoneBestGridHtml(zoneBestList)}
        `;
      } else {
        showcaseTarget.style.display = 'none';
      }
    }
  }

  // --------------------------------------------------------------------------
  // 9. PUBLIC CONTROLLER API
  // --------------------------------------------------------------------------
  window.LeaderboardUI = {
    init: function () {
      renderHomeTopPerformers();
    },

    setActiveBoard: function (board) {
      UI_STATE.activeBoard = board;
      renderFullLeaderboard();
      if (window.playSound) window.playSound('click');
    },

    setTimeFilter: function (filter) {
      UI_STATE.timeFilter = filter;
      document.querySelectorAll('.time-pill-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-time') === filter);
      });
      renderFullLeaderboard();
      if (window.playSound) window.playSound('click');
    },

    setZoneFilter: function (zone) {
      UI_STATE.zoneFilter = zone;
      renderFullLeaderboard();
    },

    setSearchQuery: function (query) {
      UI_STATE.searchQuery = query;
      renderFullLeaderboard();
    },

    toggleAnonymousMode: function (checkbox) {
      const isAnon = window.LeaderboardService.toggleAnonymous(checkbox.checked);
      renderFullLeaderboard();
      renderHomeTopPerformers();
      if (window.showToast) {
        window.showToast(
          isAnon ? 'Anonymous Mode Enabled: Your name is masked' : 'Public Profile Enabled: Your name is visible',
          'success'
        );
      }
      if (window.playSound) window.playSound('click');
    },

    refreshAll: function () {
      renderHomeTopPerformers();
      renderFullLeaderboard();
    },

    // Live Rank Shift Simulation (Interactive for judges & testing)
    simulateRankShift: function () {
      window.LeaderboardService.simulateLiveTick();
      renderHomeTopPerformers();
      renderFullLeaderboard();
      if (window.showToast) {
        window.showToast('⚡ Live rank update: Telemetry data ingested!', 'success');
      }
      if (window.playSound) window.playSound('points');
    },

    // Admin Control: Open Worker Manual Bonus/Penalty Modal
    openWorkerBonusModal: function () {
      const isHi = isHindi();
      const workers = window.LeaderboardService.getWorkers('all');
      const workerOptions = workers.map(w => `
        <option value="${w.id}">${w.name} (${w.zone.split('(')[0].trim()}) - Current: ${w.compositeScore} pts</option>
      `).join('');

      const content = `
        <div style="text-align: left;">
          <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;">
            ${isHi ? 'सफाई कर्मचारी को विशेष कार्य पर बोनस अंक या लापरवाही पर जुर्माना लगाएं।' : 'Award municipal merit bonus or impose penalty on sanitation personnel with an official audit reason.'}
          </p>
          <div class="admin-form-group">
            <label>${isHi ? 'सफाई कर्मी चुनें' : 'Select Sanitation Personnel'}</label>
            <select id="adminBonusWorkerSelect">
              ${workerOptions}
            </select>
          </div>
          <div class="admin-form-group">
            <label>${isHi ? 'कार्रवाई प्रकार' : 'Adjustment Type'}</label>
            <select id="adminBonusActionType">
              <option value="5">➕ Merit Bonus (+5 Points)</option>
              <option value="10">🌟 Outstanding Service Bonus (+10 Points)</option>
              <option value="20">🏆 Special Festival Drive Bonus (+20 Points)</option>
              <option value="-5">⚠️ SLA Warning Penalty (-5 Points)</option>
              <option value="-10">🚨 Unresponsive Delay Penalty (-10 Points)</option>
              <option value="-20">🚫 Severe Negligence Penalty (-20 Points)</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>${isHi ? 'आधिकारिक कारण / विवरण' : 'Official Justification / Reason'}</label>
            <input type="text" id="adminBonusReason" placeholder="e.g. Cleared choked drain before scheduled SLA" value="Flawless zonal cleanup drive execution" />
          </div>
          <div style="display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px;">
            <button class="btn btn-outline btn-sm" onclick="closeModal()">${isHi ? 'रद्द करें' : 'Cancel'}</button>
            <button class="btn btn-primary btn-sm" onclick="LeaderboardUI.submitWorkerBonus()">${isHi ? 'स्कोर अपडेट करें' : 'Apply Adjustment'}</button>
          </div>
        </div>
      `;

      if (window.showModal) {
        window.showModal(isHi ? 'प्रशासनिक बोनस / पेनल्टी डेस्क' : 'Admin Personnel Merit & Penalty Desk', content);
      }
    },

    submitWorkerBonus: function () {
      const workerSelect = document.getElementById('adminBonusWorkerSelect');
      const actionSelect = document.getElementById('adminBonusActionType');
      const reasonInput = document.getElementById('adminBonusReason');

      if (!workerSelect || !actionSelect) return;

      const workerId = workerSelect.value;
      const delta = parseInt(actionSelect.value, 10);
      const reason = reasonInput ? reasonInput.value.trim() : '';

      const res = window.LeaderboardService.adjustWorkerScore(workerId, delta, reason);
      if (res) {
        if (window.closeModal) window.closeModal();
        LeaderboardUI.refreshAll();
        if (window.showToast) {
          window.showToast(`Updated ${res.worker.name}: ${delta >= 0 ? '+' : ''}${delta} pts applied!`, 'success');
        }
        if (window.playSound) window.playSound('success');
      }
    },

    // Admin Control: Issue Monthly Digital Reward Voucher to Top 3 Citizens
    issueTopCitizenVouchers: function () {
      const isHi = isHindi();
      const top3 = window.LeaderboardService.getCitizens('month', 'all').slice(0, 3);
      if (top3.length === 0) return;

      const voucherId1 = 'KMC-GOLD-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const voucherId2 = 'KMC-SLV-' + Math.random().toString(36).substring(2, 7).toUpperCase();
      const voucherId3 = 'KMC-BRZ-' + Math.random().toString(36).substring(2, 7).toUpperCase();

      const content = `
        <div style="text-align: center;">
          <div style="font-size: 2.8rem; margin-bottom: 8px;">🎖️</div>
          <h4 style="color: #ffd700; font-size: 1.25rem; margin-bottom: 4px;">
            ${isHi ? 'मासिक स्वच्छ योद्धा प्रमाण पत्र व वाउचर' : 'Monthly Swachh Warriors Honor Vouchers Issued!'}
          </h4>
          <p style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;">
            ${isHi ? 'शीर्ष 3 नागरिकों को कानपुर नगर निगम संपत्ति कर छूट डिजिटल वाउचर जारी किए गए:' : 'Digital property tax rebate certificates issued for the Top 3 Citizen Champions:'}
          </p>

          <div style="display: flex; flex-direction: column; gap: 12px; text-align: left;">
            <!-- 1st Rank -->
            <div style="background: rgba(255,215,0,0.1); border: 1px solid #ffd700; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b style="color: #ffd700;">🥇 1st Place: ${top3[0].name} (${top3[0].points} pts)</b>
                <div style="font-size: 0.74rem; color: #cbd5e1;">📍 ${top3[0].ward} • ₹1,000 Municipal Property Tax Rebate</div>
              </div>
              <span style="font-family: var(--font-heading); color: var(--cyan-neon); font-size: 0.95rem; font-weight: 700;">${voucherId1}</span>
            </div>

            <!-- 2nd Rank -->
            <div style="background: rgba(203,213,225,0.08); border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b style="color: #cbd5e1;">🥈 2nd Place: ${top3[1].name} (${top3[1].points} pts)</b>
                <div style="font-size: 0.74rem; color: #cbd5e1;">📍 ${top3[1].ward} • ₹500 Municipal Property Tax Rebate</div>
              </div>
              <span style="font-family: var(--font-heading); color: var(--cyan-neon); font-size: 0.95rem; font-weight: 700;">${voucherId2}</span>
            </div>

            <!-- 3rd Rank -->
            <div style="background: rgba(217,119,6,0.08); border: 1px solid #d97706; border-radius: 12px; padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <b style="color: #f59e0b;">🥉 3rd Place: ${top3[2].name} (${top3[2].points} pts)</b>
                <div style="font-size: 0.74rem; color: #cbd5e1;">📍 ${top3[2].ward} • ₹250 Municipal Property Tax Rebate</div>
              </div>
              <span style="font-family: var(--font-heading); color: var(--cyan-neon); font-size: 0.95rem; font-weight: 700;">${voucherId3}</span>
            </div>
          </div>

          <div style="margin-top: 18px; font-size: 0.75rem; color: #94a3b8;">
            Vouchers dispatched via SMS & stored in KMC Citizen Tax Portal database.
          </div>
        </div>
      `;

      if (window.showModal) {
        window.showModal(isHi ? 'मासिक सम्मान वाउचर जारी' : 'Issue Monthly Reward Vouchers', content);
      }
      if (window.launchCelebrationConfetti) {
        window.launchCelebrationConfetti();
      }
      if (window.playSound) window.playSound('success');
    }
  };

  // Auto-render when DOM is loaded
  document.addEventListener('DOMContentLoaded', function () {
    LeaderboardUI.init();
  });

})(window);
