/**
 * ==============================================================================
 * SWACHHSETU LEADERBOARD DATA SERVICE (leaderboard-data.js)
 * Kanpur Smart City Mission • Swachh Survekshan 2026
 * 
 * Handles data, scoring logic, Kanpur municipal wards, and persistence
 * for Citizen Warriors and Safai Heroes.
 * ==============================================================================
 */

(function (window) {
  'use strict';

  // 1. KANPUR MUNICIPAL WARDS LIST
  const KANPUR_WARDS = [
    'Kidwai Nagar (Ward 6)',
    'Kakadeo (Ward 2)',
    'Civil Lines (Ward 4)',
    'Govind Nagar (Ward 5)',
    'Panki (Ward 8)',
    'Swaroop Nagar (Ward 1)',
    'Kalyanpur (Ward 3)',
    'Arya Nagar (Ward 7)',
    'Barra (Ward 9)',
    'Cantt (Ward 10)'
  ];

  // 2. BADGE TIER LOGIC FOR CITIZENS
  // Bronze (0-100), Silver (101-300), Gold (301-600), Platinum (600+), "Swachh Champion" (Rank #1 or Special)
  function getCitizenBadge(points, rank) {
    if (rank === 1) {
      return {
        id: 'champion',
        nameEn: 'Swachh Champion',
        nameHi: 'स्वच्छ चैंपियन',
        icon: '👑',
        class: 'badge-champion',
        tier: 'Champion'
      };
    }
    if (points >= 600) {
      return {
        id: 'platinum',
        nameEn: 'Platinum Crusader',
        nameHi: 'प्लैटिनम योद्धा',
        icon: '💎',
        class: 'badge-platinum',
        tier: 'Platinum (600+)'
      };
    }
    if (points >= 301) {
      return {
        id: 'gold',
        nameEn: 'Gold Sentinel',
        nameHi: 'स्वर्ण प्रहरी',
        icon: '🥇',
        class: 'badge-gold',
        tier: 'Gold (301-600)'
      };
    }
    if (points >= 101) {
      return {
        id: 'silver',
        nameEn: 'Silver Guardian',
        nameHi: 'रजत संरक्षक',
        icon: '🥈',
        class: 'badge-silver',
        tier: 'Silver (101-300)'
      };
    }
    return {
      id: 'bronze',
      nameEn: 'Bronze Scout',
      nameHi: 'कांस्य स्काउट',
      icon: '🥉',
      class: 'badge-bronze',
      tier: 'Bronze (0-100)'
    };
  }

  // 3. COMPOSITE SCORE CALCULATION FOR SAFAI HEROES (SANITATION WORKERS)
  // Formula: (SLA% × 0.4) + (Rating × 20 × 0.3) + (Resolved ratio × 0.2) + (Speed score × 0.1)
  function calculateWorkerCompositeScore(worker) {
    const slaPercent = Math.min(100, Math.max(0, parseFloat(worker.slaPercent) || 0));
    const rating = Math.min(5, Math.max(0, parseFloat(worker.rating) || 0));
    const assigned = parseInt(worker.assigned, 10) || 1;
    const resolved = parseInt(worker.resolved, 10) || 0;
    const resolvedRatio = Math.min(100, (resolved / assigned) * 100);

    // Speed score: Turnaround hours inverse curve (1.0h = 100 pts, 2.0h = 85 pts, 4h = 55 pts, 8h+ = 15 pts)
    const avgHours = parseFloat(worker.avgTurnaroundHours) || 3.0;
    let speedScore = 100 - (avgHours * 10);
    if (speedScore < 10) speedScore = 10;
    if (speedScore > 100) speedScore = 100;

    const partSla = slaPercent * 0.4;
    const partRating = (rating * 20) * 0.3;
    const partResolved = resolvedRatio * 0.2;
    const partSpeed = speedScore * 0.1;

    // Bonus points added/deducted by municipal admin
    const adminDelta = parseFloat(worker.adminDeltaScore) || 0;

    const total = Math.round((partSla + partRating + partResolved + partSpeed + adminDelta) * 10) / 10;
    
    return {
      total: Math.min(100, Math.max(0, total)),
      breakdown: {
        partSla: Math.round(partSla * 10) / 10,
        partRating: Math.round(partRating * 10) / 10,
        partResolved: Math.round(partResolved * 10) / 10,
        partSpeed: Math.round(partSpeed * 10) / 10,
        speedScore: Math.round(speedScore),
        resolvedRatio: Math.round(resolvedRatio * 10) / 10,
        adminDelta: Math.round(adminDelta * 10) / 10
      }
    };
  }

  // 4. MOCK DATA: 18 KANPUR CITIZENS ("Swachh Warriors")
  // Realistic Kanpur residents with authentic names, wards, complaint counts and points
  const INITIAL_CITIZENS = [
    {
      id: 'cit-01',
      name: 'Priya Verma',
      ward: 'Civil Lines (Ward 4)',
      avatar: 'PV',
      color: '#b46bff',
      pointsAllTime: 840,
      pointsThisMonth: 260,
      pointsThisWeek: 75,
      totalComplaints: 48,
      resolvedComplaints: 46,
      photoProofs: 44,
      fakeReports: 0,
      prevRank: 1,
      isCurrentUser: false
    },
    {
      id: 'cit-02',
      name: 'Amit Awasthi',
      ward: 'Kakadeo (Ward 2)',
      avatar: 'AA',
      color: '#22e4ff',
      pointsAllTime: 790,
      pointsThisMonth: 245,
      pointsThisWeek: 65,
      totalComplaints: 44,
      resolvedComplaints: 42,
      photoProofs: 41,
      fakeReports: 0,
      prevRank: 2,
      isCurrentUser: false
    },
    {
      id: 'cit-03',
      name: 'Sunita Pandey',
      ward: 'Govind Nagar (Ward 5)',
      avatar: 'SP',
      color: '#00e676',
      pointsAllTime: 720,
      pointsThisMonth: 210,
      pointsThisWeek: 60,
      totalComplaints: 41,
      resolvedComplaints: 39,
      photoProofs: 38,
      fakeReports: 0,
      prevRank: 4,
      isCurrentUser: false
    },
    {
      id: 'cit-04',
      name: 'Rajesh Shukla',
      ward: 'Swaroop Nagar (Ward 1)',
      avatar: 'RS',
      color: '#ff9f1c',
      pointsAllTime: 580,
      pointsThisMonth: 180,
      pointsThisWeek: 45,
      totalComplaints: 33,
      resolvedComplaints: 31,
      photoProofs: 30,
      fakeReports: 0,
      prevRank: 3,
      isCurrentUser: false
    },
    {
      id: 'cit-05',
      name: 'Ananya Mishra',
      ward: 'Arya Nagar (Ward 7)',
      avatar: 'AM',
      color: '#ff3366',
      pointsAllTime: 540,
      pointsThisMonth: 165,
      pointsThisWeek: 50,
      totalComplaints: 31,
      resolvedComplaints: 29,
      photoProofs: 28,
      fakeReports: 0,
      prevRank: 6,
      isCurrentUser: false
    },
    {
      id: 'cit-06',
      name: 'Vikram Singh',
      ward: 'Cantt (Ward 10)',
      avatar: 'VS',
      color: '#38bdf8',
      pointsAllTime: 490,
      pointsThisMonth: 150,
      pointsThisWeek: 40,
      totalComplaints: 28,
      resolvedComplaints: 26,
      photoProofs: 25,
      fakeReports: 0,
      prevRank: 5,
      isCurrentUser: false
    },
    {
      id: 'cit-07',
      name: 'Neha Gupta',
      ward: 'Kidwai Nagar (Ward 6)',
      avatar: 'NG',
      color: '#a855f7',
      pointsAllTime: 430,
      pointsThisMonth: 135,
      pointsThisWeek: 35,
      totalComplaints: 25,
      resolvedComplaints: 24,
      photoProofs: 23,
      fakeReports: 0,
      prevRank: 7,
      isCurrentUser: false
    },
    {
      id: 'cit-08',
      name: 'Deepak Tiwari',
      ward: 'Barra (Ward 9)',
      avatar: 'DT',
      color: '#eab308',
      pointsAllTime: 380,
      pointsThisMonth: 120,
      pointsThisWeek: 30,
      totalComplaints: 22,
      resolvedComplaints: 21,
      photoProofs: 20,
      fakeReports: 0,
      prevRank: 9,
      isCurrentUser: false
    },
    {
      id: 'cit-09',
      name: 'Pooja Bajpai',
      ward: 'Kalyanpur (Ward 3)',
      avatar: 'PB',
      color: '#10b981',
      pointsAllTime: 320,
      pointsThisMonth: 105,
      pointsThisWeek: 25,
      totalComplaints: 19,
      resolvedComplaints: 18,
      photoProofs: 17,
      fakeReports: 0,
      prevRank: 8,
      isCurrentUser: false
    },
    {
      id: 'cit-10',
      name: 'Alok Saxena',
      ward: 'Panki (Ward 8)',
      avatar: 'AS',
      color: '#6366f1',
      pointsAllTime: 280,
      pointsThisMonth: 90,
      pointsThisWeek: 20,
      totalComplaints: 16,
      resolvedComplaints: 15,
      photoProofs: 15,
      fakeReports: 0,
      prevRank: 10,
      isCurrentUser: false
    },
    {
      id: 'cit-11',
      name: 'Ritu Agarwal',
      ward: 'Civil Lines (Ward 4)',
      avatar: 'RA',
      color: '#ec4899',
      pointsAllTime: 240,
      pointsThisMonth: 75,
      pointsThisWeek: 20,
      totalComplaints: 14,
      resolvedComplaints: 13,
      photoProofs: 13,
      fakeReports: 0,
      prevRank: 11,
      isCurrentUser: false
    },
    {
      id: 'cit-current', // Logged in user: Rohan Sharma! Connected with navbar 120 PTS
      name: 'Rohan Sharma',
      ward: 'Kidwai Nagar (Ward 6)',
      avatar: 'RS',
      color: '#22e4ff',
      pointsAllTime: 120, // Synchronized with APP_STATE.user.points
      pointsThisMonth: 55,
      pointsThisWeek: 25,
      totalComplaints: 9,
      resolvedComplaints: 8,
      photoProofs: 8,
      fakeReports: 0,
      prevRank: 13,
      isCurrentUser: true
    },
    {
      id: 'cit-12',
      name: 'Saurabh Tripathi',
      ward: 'Kakadeo (Ward 2)',
      avatar: 'ST',
      color: '#14b8a6',
      pointsAllTime: 190,
      pointsThisMonth: 60,
      pointsThisWeek: 15,
      totalComplaints: 11,
      resolvedComplaints: 10,
      photoProofs: 10,
      fakeReports: 0,
      prevRank: 12,
      isCurrentUser: false
    },
    {
      id: 'cit-13',
      name: 'Divya Srivastava',
      ward: 'Govind Nagar (Ward 5)',
      avatar: 'DS',
      color: '#f97316',
      pointsAllTime: 150,
      pointsThisMonth: 45,
      pointsThisWeek: 15,
      totalComplaints: 9,
      resolvedComplaints: 8,
      photoProofs: 8,
      fakeReports: 0,
      prevRank: 14,
      isCurrentUser: false
    },
    {
      id: 'cit-14',
      name: 'Rahul Chaurasia',
      ward: 'Barra (Ward 9)',
      avatar: 'RC',
      color: '#84cc16',
      pointsAllTime: 90,
      pointsThisMonth: 30,
      pointsThisWeek: 10,
      totalComplaints: 6,
      resolvedComplaints: 5,
      photoProofs: 5,
      fakeReports: 0,
      prevRank: 15,
      isCurrentUser: false
    },
    {
      id: 'cit-15',
      name: 'Sneha Yadav',
      ward: 'Panki (Ward 8)',
      avatar: 'SY',
      color: '#06b6d4',
      pointsAllTime: 70,
      pointsThisMonth: 25,
      pointsThisWeek: 10,
      totalComplaints: 5,
      resolvedComplaints: 4,
      photoProofs: 4,
      fakeReports: 0,
      prevRank: 16,
      isCurrentUser: false
    },
    {
      id: 'cit-16',
      name: 'Manoj Tiwari',
      ward: 'Arya Nagar (Ward 7)',
      avatar: 'MT',
      color: '#8b5cf6',
      pointsAllTime: 50,
      pointsThisMonth: 20,
      pointsThisWeek: 0,
      totalComplaints: 4,
      resolvedComplaints: 3,
      photoProofs: 3,
      fakeReports: 0,
      prevRank: 17,
      isCurrentUser: false
    },
    {
      id: 'cit-17',
      name: 'Kavita Dixit',
      ward: 'Swaroop Nagar (Ward 1)',
      avatar: 'KD',
      color: '#d946ef',
      pointsAllTime: 30,
      pointsThisMonth: 10,
      pointsThisWeek: 0,
      totalComplaints: 2,
      resolvedComplaints: 2,
      photoProofs: 2,
      fakeReports: 0,
      prevRank: 18,
      isCurrentUser: false
    }
  ];

  // 5. MOCK DATA: 16 KANPUR SANITATION HEROES ("Safai Heroes")
  // Realistic municipal sanitation crew profiles with vehicle, zone, SLAs, ratings, and stats
  const INITIAL_WORKERS = [
    {
      id: 'wrk-101',
      name: 'Raju Kumar',
      vehicle: 'EV Tipper #101',
      zone: 'Kidwai Nagar (Ward 6)',
      assigned: 146,
      resolved: 143,
      avgTurnaroundHours: 1.8,
      slaPercent: 98.6,
      rating: 4.9,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: true,
      perk: '₹2,500 Cash Award + Smart Watch + Honor Certificate',
      prevRank: 1
    },
    {
      id: 'wrk-102',
      name: 'Sunita Devi',
      vehicle: 'Mini EV Van #103',
      zone: 'Kakadeo (Ward 2)',
      assigned: 138,
      resolved: 136,
      avgTurnaroundHours: 2.0,
      slaPercent: 98.2,
      rating: 5.0,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      perk: '₹1,500 Cash Voucher + Certificate',
      prevRank: 2
    },
    {
      id: 'wrk-103',
      name: 'Amit Verma',
      vehicle: 'Road Sweeper #102',
      zone: 'Govind Nagar (Ward 5)',
      assigned: 130,
      resolved: 126,
      avgTurnaroundHours: 2.2,
      slaPercent: 97.4,
      rating: 4.8,
      status: 'On Duty',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      perk: '₹1,000 Cash Voucher + Certificate',
      prevRank: 3
    },
    {
      id: 'wrk-104',
      name: 'Rajesh Rawat',
      vehicle: 'Compactor #105',
      zone: 'Civil Lines (Ward 4)',
      assigned: 124,
      resolved: 120,
      avgTurnaroundHours: 2.4,
      slaPercent: 96.8,
      rating: 4.7,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 4
    },
    {
      id: 'wrk-105',
      name: 'Mohan Lal',
      vehicle: 'Suction Unit #104',
      zone: 'Swaroop Nagar (Ward 1)',
      assigned: 118,
      resolved: 113,
      avgTurnaroundHours: 2.6,
      slaPercent: 96.0,
      rating: 4.8,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 6
    },
    {
      id: 'wrk-106',
      name: 'Ram Singh',
      vehicle: 'Tipper EV #106',
      zone: 'Cantt (Ward 10)',
      assigned: 112,
      resolved: 106,
      avgTurnaroundHours: 2.8,
      slaPercent: 95.1,
      rating: 4.7,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 5
    },
    {
      id: 'wrk-107',
      name: 'Suresh Yadav',
      vehicle: 'Mini Dumper #107',
      zone: 'Kalyanpur (Ward 3)',
      assigned: 105,
      resolved: 99,
      avgTurnaroundHours: 3.1,
      slaPercent: 94.5,
      rating: 4.6,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 7
    },
    {
      id: 'wrk-108',
      name: 'Bablu Prajapati',
      vehicle: 'Road Sweeper #108',
      zone: 'Barra (Ward 9)',
      assigned: 99,
      resolved: 92,
      avgTurnaroundHours: 3.4,
      slaPercent: 93.8,
      rating: 4.5,
      status: 'On Duty',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 9
    },
    {
      id: 'wrk-109',
      name: 'Dinesh Kumar',
      vehicle: 'Tipper EV #109',
      zone: 'Arya Nagar (Ward 7)',
      assigned: 95,
      resolved: 88,
      avgTurnaroundHours: 3.6,
      slaPercent: 92.5,
      rating: 4.6,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 8
    },
    {
      id: 'wrk-110',
      name: 'Geeta Rani',
      vehicle: 'Sanitation Auto #110',
      zone: 'Kidwai Nagar (Ward 6)',
      assigned: 90,
      resolved: 83,
      avgTurnaroundHours: 3.8,
      slaPercent: 93.0,
      rating: 4.5,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 10
    },
    {
      id: 'wrk-111',
      name: 'Santosh Pal',
      vehicle: 'Silt Suction #111',
      zone: 'Kakadeo (Ward 2)',
      assigned: 86,
      resolved: 78,
      avgTurnaroundHours: 4.1,
      slaPercent: 90.6,
      rating: 4.4,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 11
    },
    {
      id: 'wrk-112',
      name: 'Rakesh Balmiki',
      vehicle: 'Hydraulic Compactor #112',
      zone: 'Panki (Ward 8)',
      assigned: 92,
      resolved: 78,
      avgTurnaroundHours: 4.6,
      slaPercent: 88.0,
      rating: 4.3,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 12
    },
    {
      id: 'wrk-113',
      name: 'Rameshwar Dayal',
      vehicle: 'Road Sweeper #113',
      zone: 'Govind Nagar (Ward 5)',
      assigned: 82,
      resolved: 69,
      avgTurnaroundHours: 5.2,
      slaPercent: 85.0,
      rating: 4.1,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 13
    },
    {
      id: 'wrk-114',
      name: 'Anita Devi',
      vehicle: 'Waste Loader #114',
      zone: 'Civil Lines (Ward 4)',
      assigned: 76,
      resolved: 63,
      avgTurnaroundHours: 5.8,
      slaPercent: 82.7,
      rating: 4.0,
      status: 'Active',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 14
    },
    {
      id: 'wrk-115',
      name: 'Manoj Paswan',
      vehicle: 'Zone 1 Ti-104',
      zone: 'Panki (Ward 8)',
      assigned: 72,
      resolved: 49,
      avgTurnaroundHours: 8.4,
      slaPercent: 68.6,
      rating: 3.2,
      status: 'Unresponsive / SLA Breached', // Match admin escalation
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 15
    },
    {
      id: 'wrk-116',
      name: 'Jagdish Prasad',
      vehicle: 'Tipper Manual #116',
      zone: 'Barra (Ward 9)',
      assigned: 65,
      resolved: 42,
      avgTurnaroundHours: 9.2,
      slaPercent: 64.6,
      rating: 3.1,
      status: 'Unresponsive / SLA Breached',
      adminDeltaScore: 0,
      isEmployeeOfMonth: false,
      prevRank: 16
    }
  ];

  // 6. STATE STORAGE & PERSISTENCE SERVICE
  class LeaderboardServiceClass {
    constructor() {
      this.isAnonymousUser = false;
      this.loadState();
    }

    loadState() {
      try {
        const storedAnon = localStorage.getItem('swachhsetu_user_anonymous');
        this.isAnonymousUser = storedAnon === 'true';

        const storedCitizens = localStorage.getItem('swachhsetu_citizens_data');
        if (storedCitizens) {
          this.citizens = JSON.parse(storedCitizens);
        } else {
          this.citizens = JSON.parse(JSON.stringify(INITIAL_CITIZENS));
        }

        const storedWorkers = localStorage.getItem('swachhsetu_workers_data');
        if (storedWorkers) {
          this.workers = JSON.parse(storedWorkers);
        } else {
          this.workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
        }

        // Audit log of admin actions
        const storedAudit = localStorage.getItem('swachhsetu_admin_audit_log');
        if (storedAudit) {
          this.adminAuditLog = JSON.parse(storedAudit);
        } else {
          this.adminAuditLog = [
            {
              id: 'AUD-01',
              timestamp: '2026-10-01 08:30',
              target: 'Raju Kumar (Kidwai Nagar)',
              action: '+5 Bonus Points',
              reason: 'Flawless morning market clearance before 7 AM',
              admin: 'Zone Officer KMC'
            },
            {
              id: 'AUD-02',
              timestamp: '2026-09-30 18:15',
              target: 'Manoj Paswan (Panki)',
              action: '-10 Penalty Points',
              reason: 'Repeatedly unattended ticket #TKT-KN-9102',
              admin: 'Superintendent KMC'
            }
          ];
        }
      } catch (e) {
        console.warn('LocalStorage error in LeaderboardService, using defaults', e);
        this.citizens = JSON.parse(JSON.stringify(INITIAL_CITIZENS));
        this.workers = JSON.parse(JSON.stringify(INITIAL_WORKERS));
        this.adminAuditLog = [];
      }
    }

    saveState() {
      try {
        localStorage.setItem('swachhsetu_user_anonymous', this.isAnonymousUser ? 'true' : 'false');
        localStorage.setItem('swachhsetu_citizens_data', JSON.stringify(this.citizens));
        localStorage.setItem('swachhsetu_workers_data', JSON.stringify(this.workers));
        localStorage.setItem('swachhsetu_admin_audit_log', JSON.stringify(this.adminAuditLog));
      } catch (e) {
        console.warn('Could not save to localStorage', e);
      }
    }

    // Connects with APP_STATE.user.points (Navbar 120 PTS)
    syncCurrentUserPoints(pts) {
      const user = this.citizens.find(c => c.isCurrentUser);
      if (user) {
        const delta = pts - user.pointsAllTime;
        user.pointsAllTime = pts;
        user.pointsThisMonth = Math.max(0, user.pointsThisMonth + delta);
        user.pointsThisWeek = Math.max(0, user.pointsThisWeek + delta);
        this.saveState();
      }
    }

    // Toggle anonymous name privacy
    toggleAnonymous(val) {
      this.isAnonymousUser = (val !== undefined) ? !!val : !this.isAnonymousUser;
      this.saveState();
      return this.isAnonymousUser;
    }

    isAnonymous() {
      return this.isAnonymousUser;
    }

    // Return citizens list with sorted ranks and badges for given time filter and zone filter
    getCitizens(timeFilter = 'all', zoneFilter = 'all') {
      let list = this.citizens.map(c => Object.assign({}, c));

      // Filter by zone if selected
      if (zoneFilter && zoneFilter !== 'all') {
        list = list.filter(c => c.ward.toLowerCase().includes(zoneFilter.toLowerCase()));
      }

      // Sort according to selected time frame
      list.sort((a, b) => {
        let ptsA = a.pointsAllTime;
        let ptsB = b.pointsAllTime;
        if (timeFilter === 'week') {
          ptsA = a.pointsThisWeek;
          ptsB = b.pointsThisWeek;
        } else if (timeFilter === 'month') {
          ptsA = a.pointsThisMonth;
          ptsB = b.pointsThisMonth;
        }
        return ptsB - ptsA;
      });

      // Calculate ranks & badges
      return list.map((c, idx) => {
        const rank = idx + 1;
        let points = c.pointsAllTime;
        if (timeFilter === 'week') points = c.pointsThisWeek;
        if (timeFilter === 'month') points = c.pointsThisMonth;

        const badge = getCitizenBadge(c.pointsAllTime, rank);
        const rankDiff = c.prevRank ? (c.prevRank - rank) : 0; // Positive = climbed up

        // If anonymous is on and this is current user, mask display name
        const displayName = (c.isCurrentUser && this.isAnonymousUser) 
          ? 'Anonymous Citizen #892' 
          : c.name;

        const displayAvatar = (c.isCurrentUser && this.isAnonymousUser) 
          ? '🎭' 
          : c.avatar;

        return {
          ...c,
          rank,
          points,
          badge,
          displayName,
          displayAvatar,
          rankDiff
        };
      });
    }

    // Get current user's entry and rank in the citizen leaderboard
    getCurrentUserRank(timeFilter = 'all', zoneFilter = 'all') {
      const fullList = this.getCitizens(timeFilter, zoneFilter);
      return fullList.find(c => c.isCurrentUser) || null;
    }

    // Return workers sorted by composite score
    getWorkers(zoneFilter = 'all') {
      let list = this.workers.map(w => {
        const scoreData = calculateWorkerCompositeScore(w);
        return {
          ...w,
          compositeScore: scoreData.total,
          breakdown: scoreData.breakdown
        };
      });

      if (zoneFilter && zoneFilter !== 'all') {
        list = list.filter(w => w.zone.toLowerCase().includes(zoneFilter.toLowerCase()));
      }

      // Sort descending by composite score, then resolved tasks
      list.sort((a, b) => {
        if (b.compositeScore !== a.compositeScore) {
          return b.compositeScore - a.compositeScore;
        }
        return b.resolved - a.resolved;
      });

      return list.map((w, idx) => {
        const rank = idx + 1;
        const rankDiff = w.prevRank ? (w.prevRank - rank) : 0;
        return {
          ...w,
          rank,
          rankDiff
        };
      });
    }

    // Get zone-wise best performer for each major Kanpur ward
    getZoneBestWorkers() {
      const allWorkers = this.getWorkers('all');
      const zoneMap = {};

      allWorkers.forEach(w => {
        // Extract basic ward name, e.g. "Kidwai Nagar"
        const cleanZone = w.zone.split('(')[0].trim();
        if (!zoneMap[cleanZone]) {
          zoneMap[cleanZone] = w;
        }
      });

      return Object.keys(zoneMap).map(zone => ({
        zone,
        worker: zoneMap[zone]
      }));
    }

    // Admin Action: Give manual bonus points or penalty to worker
    adjustWorkerScore(workerId, deltaPoints, reason, adminName = 'Municipal HQ Command') {
      const worker = this.workers.find(w => w.id === workerId || String(w.id) === String(workerId));
      if (!worker) return null;

      worker.adminDeltaScore = (worker.adminDeltaScore || 0) + deltaPoints;
      
      const sign = deltaPoints >= 0 ? `+${deltaPoints}` : `${deltaPoints}`;
      const actionType = deltaPoints >= 0 ? 'Bonus Awarded' : 'Penalty Issued';
      
      // Update status if severe penalty
      if (deltaPoints < -10 && worker.status !== 'Unresponsive / SLA Breached') {
        worker.status = 'Review Pending';
      } else if (deltaPoints > 0 && worker.status === 'Review Pending') {
        worker.status = 'Active';
      }

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 16).replace('T', ' ');

      const auditEntry = {
        id: 'AUD-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        timestamp: dateStr,
        target: `${worker.name} (${worker.zone.split('(')[0].trim()})`,
        action: `${sign} Points (${actionType})`,
        reason: reason || 'Administrative performance review',
        admin: adminName
      };

      this.adminAuditLog.unshift(auditEntry);
      if (this.adminAuditLog.length > 50) this.adminAuditLog.pop();

      this.saveState();
      return { worker, auditEntry };
    }

    // Record citizen complaint rewards logic:
    // valid complaint = +10, complaint resolved = +5, photo proof = +5 bonus, fake complaint = -5
    recordCitizenActivity(activityType) {
      const user = this.citizens.find(c => c.isCurrentUser);
      if (!user) return 0;

      let pts = 0;
      if (activityType === 'valid_report') {
        pts = 10;
        user.totalComplaints++;
      } else if (activityType === 'photo_bonus') {
        pts = 5;
        user.photoProofs++;
      } else if (activityType === 'resolved_review') {
        pts = 5;
        user.resolvedComplaints++;
      } else if (activityType === 'fake_penalty') {
        pts = -5;
        user.fakeReports++;
      }

      user.pointsAllTime = Math.max(0, user.pointsAllTime + pts);
      user.pointsThisMonth = Math.max(0, user.pointsThisMonth + pts);
      user.pointsThisWeek = Math.max(0, user.pointsThisWeek + pts);

      this.saveState();
      return { pts, user };
    }

    // CSV Exporter for Admin Control
    exportCSV(type = 'citizens') {
      let csv = '';
      const now = new Date().toISOString().slice(0, 10);

      if (type === 'citizens') {
        const data = this.getCitizens('all', 'all');
        csv = 'Rank,Citizen ID,Name,Ward,Total Complaints,Resolved Complaints,Photo Proofs,Points,Badge Tier,Status\r\n';
        data.forEach(c => {
          csv += `"${c.rank}","${c.id}","${c.name}","${c.ward}","${c.totalComplaints}","${c.resolvedComplaints}","${c.photoProofs}","${c.pointsAllTime}","${c.badge.nameEn}","${c.isCurrentUser ? 'Logged In User' : 'Citizen'}"\r\n`;
        });
      } else {
        const data = this.getWorkers('all');
        csv = 'Rank,Worker ID,Name,Vehicle,Zone,Assigned Tasks,Resolved Tasks,Avg Turnaround (Hrs),SLA %,Citizen Rating,Composite Score,Status\r\n';
        data.forEach(w => {
          csv += `"${w.rank}","${w.id}","${w.name}","${w.vehicle}","${w.zone}","${w.assigned}","${w.resolved}","${w.avgTurnaroundHours}","${w.slaPercent}%","${w.rating}","${w.compositeScore}","${w.status}"\r\n`;
        });
      }

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SwachhSetu_${type.toUpperCase()}_Leaderboard_${now}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

    // Live Simulation Tick: Moves a couple of ranks up/down slightly so judges can see dynamic animations!
    simulateLiveTick() {
      // Pick random citizen (not current user) and add 5 points
      const candidates = this.citizens.filter(c => !c.isCurrentUser);
      if (candidates.length > 0) {
        const lucky = candidates[Math.floor(Math.random() * candidates.length)];
        lucky.prevRank = lucky.prevRank || 1;
        lucky.pointsAllTime += 10;
        lucky.resolvedComplaints += 1;
      }

      // Pick random worker and slightly update resolved count
      if (this.workers.length > 0) {
        const luckyW = this.workers[Math.floor(Math.random() * 5)];
        luckyW.resolved += 1;
        luckyW.assigned += 1;
      }

      this.saveState();
    }
  }

  // Expose global singleton
  window.LeaderboardService = new LeaderboardServiceClass();
  window.KANPUR_WARDS = KANPUR_WARDS;

})(window);
