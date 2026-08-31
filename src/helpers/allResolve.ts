export const resolveAssigneLevel = (val: string) => {
  if (val === 'L0')
    return { color: 'success', icon: 'tabler-user' }
  if (val === 'L1')
    return { color: 'info', icon: 'tabler-user' }
  if (val === 'L2')
    return { color: 'primary', icon: 'tabler-user' }
  if (val === 'L3')
    return { color: 'warning', icon: 'tabler-user' }

  return { color: 'primary', icon: 'tabler-user' }
}

export const resolveStatusVariant = (stat: string) => {
  const statLowerCase = stat.toLowerCase()
  if (statLowerCase === 'new')
    return 'error'
  if (statLowerCase === 'in progress')
    return 'warning'
  if (statLowerCase === 'pending')
    return 'info'
  if (statLowerCase === 'resolved')
    return 'primary'
  if (statLowerCase === 'closed')
    return 'success'

  return 'primary'
}

export const resolvePriorityVariant = (val: number) => {
  if (val === 4)
    return 'error'
  if (val === 18)
    return 'warning'
  if (val === 36)
    return 'info'
  if (val === 72)
    return 'success'

  return 'primary'
}

export const resolvePriorityString = (val: number) => {
  if (val === 4)
    return 'Critical'
  if (val === 18)
    return 'High'
  if (val === 36)
    return 'Medium'
  if (val === 72)
    return 'Low'

  return 'Low'
}

export const resolveLateVariant = (val: string) => {
  if (val === '1')
    return 'error'
  if (val === '0')
    return 'success'
}

export const resolveFraudVariant = (isFraud: number) => {
  if (isFraud === 1)
    return 'success'
  if (isFraud === 0)
    return 'secondary'
}

export const resolveFraudValue = (isFraud: number) => {
  if (isFraud === 1)
    return 'Yes'
  if (isFraud === 0)
    return 'No'
}
