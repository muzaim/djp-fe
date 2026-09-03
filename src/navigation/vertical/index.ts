// 1
export const adminTI = [
  { heading: 'User Manajemen' },
  {
    title: 'User Manajemen',
    icon: { icon: 'tabler-users' },
    children: [
      { title: 'Struktur Organisasi', to: 'user-management-struktur-organisasi-list', icon: { icon: 'tabler-sitemap' } },
      { title: 'Fungsi', to: 'user-management-struktural-list', icon: { icon: 'tabler-subtask' } },
      { title: 'User', to: 'user-management-user-list', icon: { icon: 'tabler-user' } },
      { title: 'Role', to: 'user-management-roles-list', icon: { icon: 'tabler-shield-check' } },

    ],
  },
  { heading: 'Master Data' },
  {
    title: 'Master Data',
    icon: { icon: 'tabler-database' },
    children: [
      { title: 'Keluaran Aktivitas', to: 'master-data-keluaran-aktivitas-list', icon: { icon: 'tabler-file-check' } },
      { title: 'Tanggung Jawab', to: 'master-data-tanggung-jawab-list', icon: { icon: 'tabler-list-details' } },
    ],
  },
  { heading: 'Audit Trail' },
  {
    title: 'Audit Trail',
    to: { name: 'activity-log' },
    icon: { icon: 'tabler-ticket' },
  },
]

// 2
export const adminMRK = [
  // User Management category
  { heading: 'Risk Register' },
  {
    title: 'Risk Register',
    icon: { icon: 'tabler-folder' },
    badgeClass: 'bg-global-info',
    children: [
      {
        title: 'Database Resiko Perseroan',
        to: 'risk-register-database-resiko-perseroan',
        badgeClass: 'bg-global-info',
      },
      {
        title: 'Report',
        to: 'risk-register-report',
        badgeClass: 'bg-global-info',
      },
    ],
  },
  { heading: 'Data Master' },
  {
    title: 'Data Master',
    icon: { icon: 'tabler-book' },
    children: [
      { title: 'Risk Universe', to: 'data-management-risk-universe-list' },
      { title: 'Kriteria Dampak', to: 'data-management-kriteria-dampak-detail' },
      {
        title: 'Kriteria Kemungkinan',
        children: [
          { title: 'Fraud', to: 'data-management-kriteria-kemungkinan-fraud' },
          { title: 'Non Fraud', to: 'data-management-kriteria-kemungkinan-nonfraud' },
        ],
      },
      { title: 'Proses Bisnis', to: 'data-management-proses-bisnis-list' },

      {
        title: 'Master IKU',
        children: [
          { title: 'BSC', to: 'data-management-master-iku-bsc' },
          { title: 'Sasaran Strategis', to: 'data-management-master-iku-ss' },
          { title: 'Manual IKU', to: 'data-management-master-iku-iku' },
        ],
      },
    ],
  },
  { heading: 'Loss Event Database' },
  {
    title: 'Loss Event Database',
    icon: { icon: 'tabler-folder' },
    badgeClass: 'bg-global-info',
    children: [
      {
        title: 'Inbox LED',
        to: 'led-inbox-led',
        badgeClass: 'bg-global-info',
      },
      {
        title: 'Database LED',
        to: 'led-database-led',
        badgeClass: 'bg-global-info',
      },
      {
        title: 'Report',
        to: 'led-report',
        badgeClass: 'bg-global-info',
      },
    ],
  },

  // Audit Trail category
  { heading: 'Audit Trail' },

  // Audit Trail submenu
  {
    title: 'Audit Trail',
    to: { name: 'activity-log' },
    icon: { icon: 'tabler-ticket' },
  },
]

// 3
export const makerDivisi = [
  // User Management category
  { heading: 'Risk Register' },
  {
    title: 'Risk Register',
    icon: { icon: 'tabler-folder' },
    badgeClass: 'bg-global-info',
    children: [
      {
        title: 'Inbox Risk Register',
        to: 'risk-register-inbox-risk-register',
        badgeClass: 'bg-global-info',
      },
      {
        title: 'Database Resiko Perseroan',
        to: 'risk-register-database-resiko-perseroan',
        badgeClass: 'bg-global-info',
      },
      {
        title: 'Trash',
        to: 'risk-register-trash',
        badgeClass: 'bg-global-info',
      },
    ],
  },
  { heading: 'Loss Event Database' },
  {
    title: 'Loss Event Database',
    icon: { icon: 'tabler-folder' },
    badgeClass: 'bg-global-info',
    children: [
      {
        title: 'Inbox LED',
        to: 'led-inbox-led',
        badgeClass: 'bg-global-info',
      },
      {
        title: 'Form LED',
        to: 'led-form-led',
        badgeClass: 'bg-global-info',
      },
      {
        title: 'Daftar LED',
        to: 'led-daftar-led',
        badgeClass: 'bg-global-info',
      },
      {
        title: 'Trash',
        to: 'led-trash',
        badgeClass: 'bg-global-info',
      },
    ],
  },

  // Audit Trail category
  { heading: 'Audit Trail' },

  // Audit Trail submenu
  {
    title: 'Audit Trail',
    to: { name: 'activity-log' },
    icon: { icon: 'tabler-ticket' },
  },
]

// 4
export const checkerDivisi = [
  // User Management category
  { heading: 'Risk Register' },
  {
    title: 'Risk Register',
    icon: { icon: 'tabler-folder' },
    badgeClass: 'bg-global-info',
    children: [
      {
        title: 'Inbox Risk Register',
        to: 'risk-register-inbox-risk-register',
        badgeClass: 'bg-global-info',
      },
      {
        title: 'Riwayat',
        to: 'risk-register-riwayat',
        badgeClass: 'bg-global-info',
      },
    ],
  },
  { heading: 'Loss Event Database' },
  {
    title: 'Loss Event Database',
    icon: { icon: 'tabler-folder' },
    badgeClass: 'bg-global-info',
    children: [
      {
        title: 'Inbox LED',
        to: 'incident-management-list-open',
        badgeClass: 'bg-global-info',
      },
    ],
  },

  // Audit Trail category
  { heading: 'Audit Trail' },

  // Audit Trail submenu
  {
    title: 'Audit Trail',
    to: { name: 'activity-log' },
    icon: { icon: 'tabler-ticket' },
  },
]
