export default [
  {
    title: 'Home',
    to: { name: 'root' },
    icon: { icon: 'tabler-smart-home' },
  },

  /* {
    title: 'Incident Management',
    to: { name: 'pages-misc-coming-soon' },
    icon: { icon: 'tabler-file' },
  }, */
  { heading: 'Management' },
  {
    title: 'User',
    icon: { icon: 'tabler-users' },
    children: [
      { title: 'Users', to: 'user-management-user-list' },
      { title: 'Divisi', to: 'user-management-divisi' },
      { title: 'Roles', to: 'user-management-roles' },
    ],
  },
  {
    title: 'Data Master',
    icon: { icon: 'tabler-book' },
    children: [
      { title: 'Site', to: 'data-management-site' },
      {
        title: 'FAQ',
        children: [
          { title: 'Title', to: 'data-management-faq' },
          { title: 'Q & A', to: 'data-management-faq-detail' },
        ],
      },
    ],
  },
]
