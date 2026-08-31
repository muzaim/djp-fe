const data = [
  {
    id: 1,
    description: 'PT Sarana Multigriya Finansial',
    parent_id: 0,
    parent_name: 'PT Sarana Multigriya Finansial',
    code: 'SMF',
  },
  {
    id: 2,
    description: 'Direktur Utama',
    parent_id: 1,
    parent_name: 'PT Sarana Multigriya Finansial',
    code: 'DIR',
  },
  {
    id: 14,
    description: 'Divisi Perencanaan Strategis & Manajemen Perubahan',
    parent_id: 2,
    parent_name: 'Direktur Utama',
    code: 'PSMP',
  },
  {
    id: 15,
    description: 'Bagian Manajemen Proyek & Perubahan',
    parent_id: 14,
    parent_name: 'Divisi Perencanaan Strategis & Manajemen Perubahan',
    code: 'PSMP-MP',
  },
  {
    id: 16,
    description: 'Bagian Perencanaan Strategis & Hubungan Internasional',
    parent_id: 14,
    parent_name: 'Divisi Perencanaan Strategis & Manajemen Perubahan',
    code: 'PSMP-PS',
  },
  {
    id: 17,
    description: 'Komite Pengembangan Produk',
    grade: 4,
    parent_id: 14,
    parent_name: 'Divisi Perencanaan Strategis & Manajemen Perubahan',
    code: 'KPP',
  },
  {
    id: 18,
    description: 'Task Force Implementasi KPBU',
    grade: 4,
    parent_id: 14,
    parent_name: 'Divisi Perencanaan Strategis & Manajemen Perubahan',
    code: 'TF-KPBU',
  },
  {
    id: 19,
    description: 'Divisi Riset Ekonomi',
    grade: 3,
    parent_id: 13,
    parent_name: 'Direktur Utama',
    code: 'CE',
  },
  {
    id: 20,
    description: 'Tim Ekosistem Perumahan',
    grade: 4,
    parent_id: 19,
    parent_name: 'Divisi Riset Ekonomi',
    code: 'EKOS',
  },
  {
    id: 21,
    description: 'Direktur Keuangan & Operasional',
    grade: 2,
    parent_id: 1,
    parent_name: 'PT Sarana Multigriya Finansial',
    code: 'DDKO',
  },
  {
    id: 22,
    description: 'Divisi Pengadaan dan Manajemen Aset',
    grade: 3,
    parent_id: 21,
    parent_name: 'Direktur Keuangan & Operasional',
    code: 'PMA',
  },
  {
    id: 23,
    description: 'Bagian Manajemen Aset',
    grade: 4,
    parent_id: 22,
    parent_name: 'Divisi Pengadaan dan Manajemen Aset',
    code: 'PMA-MA',
  },
  {
    id: 24,
    description: 'Bagian Pengadaan',
    grade: 4,
    parent_id: 22,
    parent_name: 'Divisi Pengadaan dan Manajemen Aset',
    code: 'PMA-P',
  },
  {
    id: 25,
    description: 'Divisi Coba',
    grade: 4,
    parent_id: 19,
    parent_name: 'Divisi Riset Ekonomi',
    code: 'FE',
  },
  {
    id: 26,
    description: 'Divisi Coba 2',
    grade: 4,
    parent_id: 19,
    parent_name: 'Divisi Riset Ekonomi',
    code: 'COBA2',
  },
]

// Fungsi rekursif untuk membuat hierarki struktur organisasi
function buildHierarchy(data) {
  const tree = {}
  const roots = []

  // Create a map of nodes by ID
  data.forEach(item => {
    tree[item.id] = { ...item, children: [] }
  })

  // Assign children to their respective parents
  data.forEach(item => {
    if (item.parent_id === 0) {
      // Root nodes
      roots.push(tree[item.id])
    }
    else {
      // Add to parent's children
      const parent = tree[item.parent_id]
      if (parent)
        parent.children.push(tree[item.id])
    }
  })

  // Function to recursively print the hierarchy
  function printHierarchy(node, level = 0) {
    const indent = '--'.repeat(level)

    console.log(indent, node.description)

    node.children.forEach(child => {
      printHierarchy(child, level + 1)
    })
  }

  // Print the entire hierarchy from roots
  roots.forEach(root => {
    printHierarchy(root)
  })
}

function buildHierarchyChildred(data, parent_id = null) {

}

// Membangun hierarki struktur organisasi
const hierarchy = buildHierarchy(data)

// Menampilkan hierarki struktur organisasi
// console.log(JSON.stringify(hierarchy, null, 2));
