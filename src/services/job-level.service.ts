export class JobLevelService {
  /**
   * Fetch job levels list via GET /job-levels
   */
  static async getJobLevels(): Promise<any[]> {
    const res = await $api('/job-levels', {
      method: 'GET',
      params: { limit: 100 },
    })

    const payload = res?.data || res
    return payload?.items || (Array.isArray(payload) ? payload : [])
  }
}
