import { refDebounced } from '@vueuse/core'
import { OrgStructureService } from '@/services/org-structure.service'
import type {
  CreateOrganizationUnitPayload,
  OrganizationUnitItem,
  UpdateOrganizationUnitPayload,
} from '@/services/types/org-structure.types'

export function useOrgStructure() {
  const orgUnits = ref<OrganizationUnitItem[]>([])
  const treeRoots = ref<any[]>([])
  const totalOrgUnits = ref(0)
  const isLoading = ref(false)

  const searchQuery = ref('')
  const debouncedSearch = refDebounced(searchQuery, 400)
  const itemsPerPage = ref(999999)
  const page = ref(1)

  const isSnackbarVisible = ref(false)
  const snackBarText = ref('')
  const snackBarColour = ref('')

  const isAddNewDrawerVisible = ref(false)
  const isConfirmDialogOpen = ref(false)
  const isChartDialogOpen = ref(false)
  const idDelete = ref<string>('')
  const detailData = ref<any>(null)

  /**
   * Fetch all organization units and order them hierarchically with depth indentation
   */
  const fetchOrgUnits = async () => {
    isLoading.value = true
    try {
      const res = await OrgStructureService.getOrganizationUnits({
        page: 1,
        limit: 999999,
        search: debouncedSearch.value,
      })

      const rawItems: OrganizationUnitItem[] = res.data || []

      // Build hierarchical tree for Chart and Table
      const itemMap = new Map<string, any>()
      const roots: any[] = []

      rawItems.forEach(item => {
        itemMap.set(String(item.id), {
          ...item,
          children: [],
        })
      })

      rawItems.forEach(item => {
        const node = itemMap.get(String(item.id))
        const pId = item.parentId || item.parent?.id
        if (pId && itemMap.has(String(pId))) {
          itemMap.get(String(pId)).children.push(node)
        }
        else {
          roots.push(node)
        }
      })

      treeRoots.value = roots

      // If searching, show matching items directly without tree building in table
      if (debouncedSearch.value && debouncedSearch.value.trim() !== '') {
        orgUnits.value = rawItems.map((item, idx) => ({
          ...item,
          depth: 0,
          index: idx + 1,
        }))
        totalOrgUnits.value = rawItems.length
        return
      }

      // Recursive flatten with depth level for table
      const flattened: any[] = []
      const flattenTree = (nodes: any[], depth = 0) => {
        nodes.forEach(node => {
          const { children, ...restNode } = node
          flattened.push({
            ...restNode,
            depth,
          })
          if (children && children.length > 0) {
            flattenTree(children, depth + 1)
          }
        })
      }

      flattenTree(roots, 0)

      orgUnits.value = flattened.map((item, idx) => ({
        ...item,
        depth: typeof item.depth === 'number' ? item.depth : 0,
        index: idx + 1,
      }))

      totalOrgUnits.value = flattened.length
    }
    catch (err: any) {
      console.error('Fetch org units error:', err)
      snackBarText.value = err?.message || 'Failed to fetch organization units'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Open drawer for adding new organization unit
   */
  const addData = () => {
    detailData.value = {
      code: '',
      name: '',
      levelType: 'DIVISION',
      parentId: undefined,
    }
    isAddNewDrawerVisible.value = true
  }

  /**
   * Fetch detail and open drawer for editing
   */
  const selectData = async (id: string) => {
    isLoading.value = true
    try {
      const res = await OrgStructureService.getOrganizationUnitById(id)
      detailData.value = res
      isAddNewDrawerVisible.value = true
    }
    catch (err: any) {
      console.error('Fetch org unit detail error:', err)
      snackBarText.value = 'Failed to fetch organization unit detail'
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  /**
   * Save organization unit (Create or Update)
   */
  const submitProcess = async (formData: any) => {
    isLoading.value = true
    try {
      if (formData.id) {
        const updatePayload: UpdateOrganizationUnitPayload = {
          id: String(formData.id),
          code: formData.code,
          name: formData.name,
          levelType: formData.levelType,
          parentId: formData.parentId || undefined,
        }

        await OrgStructureService.updateOrganizationUnit(updatePayload)
        snackBarText.value = 'Success, Update organization unit!'
      }
      else {
        const createPayload: CreateOrganizationUnitPayload = {
          code: formData.code,
          name: formData.name,
          levelType: formData.levelType,
          parentId: formData.parentId || undefined,
        }

        await OrgStructureService.createOrganizationUnit(createPayload)
        snackBarText.value = 'Success, Add new organization unit!'
      }

      snackBarColour.value = 'primary'
      isSnackbarVisible.value = true
      isAddNewDrawerVisible.value = false
      await fetchOrgUnits()
    }
    catch (err: any) {
      console.error('Submit org unit error:', err)
      const msg = err?.data?.message || err?.message || 'Error, Please check input values'
      snackBarText.value = Array.isArray(msg) ? msg.join(', ') : msg
      snackBarColour.value = 'error'
      isSnackbarVisible.value = true
    }
    finally {
      isLoading.value = false
    }
  }

  const updateDeleteData = (id: string) => {
    idDelete.value = id
  }

  /**
   * Delete organization unit upon confirmation
   */
  const deleteData = async (confirm: boolean) => {
    if (confirm && idDelete.value) {
      isLoading.value = true
      try {
        await OrgStructureService.deleteOrganizationUnit(idDelete.value)
        snackBarText.value = 'Organization unit deleted successfully!'
        snackBarColour.value = 'primary'
        isSnackbarVisible.value = true
        await fetchOrgUnits()
      }
      catch (err: any) {
        console.error('Delete org unit error:', err)
        snackBarText.value = err?.message || 'Failed to delete organization unit'
        snackBarColour.value = 'error'
        isSnackbarVisible.value = true
      }
      finally {
        isLoading.value = false
      }
    }
    idDelete.value = ''
  }

  watch([debouncedSearch], () => {
    fetchOrgUnits()
  })

  onMounted(() => {
    fetchOrgUnits()
  })

  return {
    orgUnits,
    treeRoots,
    totalOrgUnits,
    isLoading,
    searchQuery,
    itemsPerPage,
    page,
    isSnackbarVisible,
    snackBarText,
    snackBarColour,
    isAddNewDrawerVisible,
    isConfirmDialogOpen,
    isChartDialogOpen,
    detailData,
    fetchOrgUnits,
    addData,
    selectData,
    submitProcess,
    updateDeleteData,
    deleteData,
  }
}
