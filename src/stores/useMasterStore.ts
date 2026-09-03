import { defineStore } from 'pinia'
import { OrgStructureService } from '@/services/org-structure.service'
import { JobLevelService } from '@/services/job-level.service'
import { RoleService } from '@/services/role.service'
import type { DivisionItem, OrganizationUnitItem } from '@/services/types/org-structure.types'
import type { RoleItem } from '@/services/types/role.types'

export const useMasterStore = defineStore('master', () => {
  // State
  const divisions = ref<DivisionItem[]>([])
  const orgUnits = ref<OrganizationUnitItem[]>([])
  const jobLevels = ref<any[]>([])
  const roles = ref<RoleItem[]>([])

  const loadingDivisions = ref(false)
  const loadingOrgUnits = ref(false)
  const loadingJobLevels = ref(false)
  const loadingRoles = ref(false)

  /**
   * Fetch and cache Divisions (GET /organization-units/divisions)
   */
  const getDivisions = async (force = false): Promise<DivisionItem[]> => {
    if (!force && divisions.value.length > 0) {
      return divisions.value
    }

    loadingDivisions.value = true
    try {
      const res = await OrgStructureService.getDivisions()
      divisions.value = res || []
      return divisions.value
    }
    catch (err) {
      console.error('MasterStore getDivisions error:', err)
      return divisions.value
    }
    finally {
      loadingDivisions.value = false
    }
  }

  /**
   * Fetch and cache Organization Units (GET /organization-units)
   */
  const getOrgUnits = async (force = false): Promise<OrganizationUnitItem[]> => {
    if (!force && orgUnits.value.length > 0) {
      return orgUnits.value
    }

    loadingOrgUnits.value = true
    try {
      const res = await OrgStructureService.getOrganizationUnits({ limit: 1000 })
      orgUnits.value = res.data || []
      return orgUnits.value
    }
    catch (err) {
      console.error('MasterStore getOrgUnits error:', err)
      return orgUnits.value
    }
    finally {
      loadingOrgUnits.value = false
    }
  }

  /**
   * Fetch and cache Job Levels (GET /job-levels)
   */
  const getJobLevels = async (force = false): Promise<any[]> => {
    if (!force && jobLevels.value.length > 0) {
      return jobLevels.value
    }

    loadingJobLevels.value = true
    try {
      const res = await JobLevelService.getJobLevels()
      jobLevels.value = res || []
      return jobLevels.value
    }
    catch (err) {
      console.error('MasterStore getJobLevels error:', err)
      return jobLevels.value
    }
    finally {
      loadingJobLevels.value = false
    }
  }

  /**
   * Fetch and cache Roles (GET /roles)
   */
  const getRoles = async (force = false): Promise<RoleItem[]> => {
    if (!force && roles.value.length > 0) {
      return roles.value
    }

    loadingRoles.value = true
    try {
      const res = await RoleService.getRoles({ limit: 100 })
      roles.value = res.data || []
      return roles.value
    }
    catch (err) {
      console.error('MasterStore getRoles error:', err)
      return roles.value
    }
    finally {
      loadingRoles.value = false
    }
  }

  /**
   * Invalidate all cached data (called on Create/Update/Delete mutations)
   */
  const invalidateCache = () => {
    divisions.value = []
    orgUnits.value = []
    jobLevels.value = []
    roles.value = []
  }

  return {
    divisions,
    orgUnits,
    jobLevels,
    roles,
    loadingDivisions,
    loadingOrgUnits,
    loadingJobLevels,
    loadingRoles,
    getDivisions,
    getOrgUnits,
    getJobLevels,
    getRoles,
    invalidateCache,
  }
})
