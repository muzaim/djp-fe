export const workingHoursDuration = (startDate: any, duration: any, holidays = []) => {
  // Store minutes worked
  let minutesWorked = 0

  // Validate input
  if (duration <= 0)
    return 'Duration must be greater than 0.'

  // Define work range
  const workHoursStart = 8
  const workHoursEnd = 18
  const includeWeekends = true

  const breakStart = 12 // Break start hour (in 24-hour format)
  const breakEnd = 13 // Break end hour (in 24-hour format)

  // Set current date to start date
  const current = new Date(startDate)

  // Loop while minutes worked is less than duration
  while (minutesWorked < duration) {
    // Is the current time within a work day (and if it occurs on a weekend or not)
    if (
      current.getHours() >= workHoursStart
      && current.getHours() < workHoursEnd
      && (includeWeekends
        ? current.getDay() !== 0 && current.getDay() !== 6
        : true)
      && !holidays.includes(current.toISOString().split('T')[0])
      && (current.getHours() < breakStart || current.getHours() >= breakEnd)
    )
      minutesWorked++

    // Increment current time
    current.setTime(current.getTime() + 1000 * 60)
  }

  // Return the end date based on the duration
  return current
}

export const workingHoursBetweenDates = (startDate: any, endDate: any, holidays = []) => {
  // Store minutes worked
  let minutesWorked = 0

  // Validate input
  if (endDate < startDate)
    return 'End date must be greater than start date.'

  // Loop from your Start to End dates (by hour)
  const current = new Date(startDate)

  // Define work range
  const workHoursStart = 8
  const workHoursEnd = 18
  const includeWeekends = true

  const breakStart = 12 // Break start hour (in 24-hour format)
  const breakEnd = 13 // Break end hour (in 24-hour format)
  // Loop while currentDate is less than end Date (by minutes)
  while (current <= endDate) {
    // Is the current time within a work day (and if it occurs on a weekend or not)
    if (
      current.getHours() >= workHoursStart
      && current.getHours() < workHoursEnd
      && (includeWeekends
        ? current.getDay() !== 0 && current.getDay() !== 6
        : true)
      && !holidays.includes(current.toISOString().split('T')[0])
      && (current.getHours() < breakStart || current.getHours() >= breakEnd)
    )
      minutesWorked++

    // Increment current time
    current.setTime(current.getTime() + 1000 * 60)
  }

  // minutesWorked--;

  // Convert minutes to hours and minutes
  const hours = Math.floor(minutesWorked / 60)
  const minutes = minutesWorked % 60

  // Return the number of hours and minutes
  return `${hours}h ${minutes}m`
}

export const calculateRemainingTimeMode3 = (sla, progressAt, arrayLibur) => {
  const date = new Date(progressAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Bulan dimulai dari 0 (Januari)
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // Format tanggal ke format yyyy-mm-dd hh:ii:ss
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

  // console.log(`Data ke-${index + 1}:`);
  // console.log(`ID: ${item.id}`);
  // console.log(`Ticket ID: ${item.ticket_id}`);

  // Example usage
  const startDate = new Date(progressAt) // Start date
  const totalWork = sla * 9 * 60 // End date
  const holidays = arrayLibur // Holiday dates (ISO format)

  const tmpendDate = workingHoursDuration(
    startDate,
    totalWork,
    holidays,
  )

  const endDate = new Date(tmpendDate) // Start date

  const currentDate = new Date().toISOString() // Start date

  // console.log(`Progress At: ${formattedDate}`);
  // console.log(`currentDate: ${currentDate}`);
  // console.log('Start : ', startDate);
  // console.log('End : ', tmpendDate);
  // console.log('Start Convert:', startDate.getHours());
  // console.log('End Convert:', endDate.getHours());
  // console.log('Total Duration: ', totalWork);
  // console.log('Holidays : ', holidays);

  return workingHoursBetweenDates(
    currentDate,
    endDate,
    holidays,
  )
}

export const calculatePercentageMode3 = (sla: any, progressAt, arrayLibur) => {
  sla++ // Incrementing SLA by 1

  const remainingTime = calculateRemainingTimeMode3(sla, progressAt, arrayLibur)

  // Convert remaining time to minutes
  const remainingTimeArray = remainingTime.split(' ') // Split the time string into hours and minutes
  const hours = Number.parseInt(remainingTimeArray[0]) // Extract hours
  const minutes = Number.parseInt(remainingTimeArray[1]) // Extract minutes
  const remainingTimeInMinutes = hours * 60 + minutes // Convert hours to minutes and add the minutes

  let percentage = 0 // Default percentage value

  // Check if it's a late day (less than or equal to 540 minutes)
  if (remainingTimeInMinutes <= 540) {
    // Set initial percentage to 100% for late day
    percentage = 95

    // Calculate the number of 135-minute intervals for percentage decrease
    const decreaseIntervals = Math.floor((540 - remainingTimeInMinutes) / 135)

    // Decrease percentage by 5% for each interval
    percentage -= decreaseIntervals * 5

    // Ensure percentage does not go below 80%
    percentage = Math.max(percentage, 80)

    // Ensure percentage does not exceed 120%
    percentage = Math.min(percentage, 120)

    // Returning remaining time in minutes and percentage
    return `${percentage}`
  }

  // Calculate percentage based on remaining time in minutes and SLA
  for (let i = 1; i <= sla; i++) {
    // Increment percentage by 10 for each additional SLA
    if (remainingTimeInMinutes >= i * 540)
      percentage = Math.min(100 + (i - 1) * 10, 120)
  }

  // Ensure percentage does not exceed 120%
  percentage = Math.min(percentage, 120)

  // Returning remaining time in minutes and percentage
  return `${percentage}`
}

export const calculateRemainingTimeMode3Incident = (priority, progressAt, arrayLibur) => {
  const date = new Date(progressAt)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0') // Bulan dimulai dari 0 (Januari)
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')

  // Format tanggal ke format yyyy-mm-dd hh:ii:ss
  const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`

  // console.log(`Data ke-${index + 1}:`);
  // console.log(`ID: ${item.id}`);
  // console.log(`Ticket ID: ${item.ticket_id}`);

  // Example usage
  const startDate = new Date(progressAt) // Start date
  const totalWork = priority * 60 // End date
  const holidays = arrayLibur // Holiday dates (ISO format)

  const tmpendDate = workingHoursDuration(
    startDate,
    totalWork,
    holidays,
  )

  const endDate = new Date(tmpendDate) // Start date

  const currentDate = new Date().toISOString() // Start date

  // console.log(`Progress At: ${formattedDate}`);
  // console.log(`currentDate: ${currentDate}`);
  // console.log('Start : ', startDate);
  // console.log('End : ', tmpendDate);
  // console.log('Start Convert:', startDate.getHours());
  // console.log('End Convert:', endDate.getHours());
  // console.log('Total Duration: ', totalWork);
  // console.log('Holidays : ', holidays);

  return workingHoursBetweenDates(
    currentDate,
    endDate,
    holidays,
  )
}

export const calculatePercentageMode3Incident = (priority, progressAt, arrayLibur) => {
  const priorityInMinutes = priority * 60
  const waktuBonus = priority * 0.5
  const waktuBonusInMinutes = waktuBonus * 60
  const totalPengerjaan = priority + waktuBonus

  // const totalPengerjaanInMinutes = totalPengerjaan * 60

  // Hitung durasi waktu yang tersisa
  const remainingTime = calculateRemainingTimeMode3Incident(totalPengerjaan, progressAt, arrayLibur)
  const remainingTimeArray = remainingTime.split(' ')
  const hours = Number.parseInt(remainingTimeArray[0])
  const minutes = Number.parseInt(remainingTimeArray[1])
  const remainingTimeInMinutes = hours * 60 + minutes
  let percentage = 0

  if (remainingTimeInMinutes <= waktuBonusInMinutes) {
    // Hitung penurunan persentase setiap seperlima waktuBonusInMinutes
    for (let i = 1; i <= 4; i++) {
      const threshold = waktuBonusInMinutes * (i / 4) // Ambang untuk setiap seperlima waktuBonusInMinutes
      if (remainingTimeInMinutes <= threshold) {
        percentage = 80 + (i - 1) * 5 // Persentase dimulai dari 95% dan turun 5% setiap seperlima waktuBonusInMinutes
        break // Keluar dari perulangan setelah menemukan persentase yang sesuai
      }
    }

    // Pastikan persentase tidak turun di bawah 80%
    percentage = Math.max(percentage, 80)

    return `${percentage}`
  }

  // Hitung persentase berdasarkan durasi waktu yang tersisa
  for (let i = 1; i <= 3; i++) {
    const threshold = i * priorityInMinutes / 3
    if (remainingTimeInMinutes - waktuBonusInMinutes <= threshold) {
      percentage = 100 + (i - 1) * 10 // Persentase dimulai dari 100% dan naik 10% setiap sepertiga waktu
      break // Keluar dari perulangan setelah menemukan persentase yang sesuai
    }
  }

  // Kembalikan persentase
  return `${percentage}`
}

export const calculateRemainingTimeMode3Pending = (sla, progressAt, pendingAt) => {
  const startMorningHour = 8 // 9 AM
  const endMorningHour = 12 // 12 PM
  const startAfternoonHour = 13 // 1 PM
  const endAfternoonHour = 18 // 6 PM

  // Total working time in minutes (per SLA)
  const totalWorkingTime = sla * 9 * 60

  // Get the progress date
  const progressDate = new Date(progressAt)

  // Get the current date
  const currentDate = new Date(pendingAt)

  // Initialize remaining work time
  let remainingWorkTime = totalWorkingTime

  // Calculate difference in minutes between current time and progress time
  const timeDifferenceInMinutes = Math.ceil((currentDate - progressDate) / (1000 * 60))

  // Iterate through each minute of the time difference
  for (let i = 0; i < timeDifferenceInMinutes; i++) {
    const currentIterationTime = new Date(progressDate.getTime() + (i * 60 * 1000))
    const currentHour = currentIterationTime.getHours()
    const currentDay = currentIterationTime.getDay() // 0 for Sunday, 1 for Monday, ..., 6 for Saturday
    const currentMinutes = currentIterationTime.getMinutes()

    // Check if current time falls within working hours and it's not Saturday or Sunday
    if (
      (currentHour >= startMorningHour && currentHour < endMorningHour)
      || (currentHour >= startAfternoonHour && currentHour < endAfternoonHour)
    ) {
      if (currentDay !== 0 && currentDay !== 6) { // Skip counting if it's Saturday or Sunday
        remainingWorkTime-- // Decrease remaining work time by 1 minute for each minute worked during working hours
      }
    }
  }

  // Ensure remaining work time doesn't go negative
  remainingWorkTime = Math.max(remainingWorkTime, 0)

  // Calculate remaining hours and minutes
  const remainingHours = Math.floor(remainingWorkTime / 60)
  const remainingMinutes = remainingWorkTime % 60

  return `${remainingHours}h ${remainingMinutes}m`
}

export const calculatePercentageMode3Pending = (sla, progressAt, pendingAt) => {
  sla++ // Menambahkan 1 SLA

  const remainingTime = calculateRemainingTimeMode3Pending(sla, progressAt, pendingAt)

  // Convert remaining time to minutes
  const remainingTimeArray = remainingTime.split(' ') // Split the time string into hours and minutes
  const hours = Number.parseInt(remainingTimeArray[0]) // Extract hours
  const minutes = Number.parseInt(remainingTimeArray[1]) // Extract minutes
  const remainingTimeInMinutes = hours * 60 + minutes // Convert hours to minutes and add the minutes

  let percentage = 0 // Default percentage value

  // Check if it's a late day (less than or equal to 540 minutes)
  if (remainingTimeInMinutes <= 540) {
    // Set initial percentage to 100% for late day
    percentage = 95

    // Calculate the number of 135-minute intervals for percentage decrease
    const decreaseIntervals = Math.floor((540 - remainingTimeInMinutes) / 135)

    // Decrease percentage by 5% for each interval
    percentage -= decreaseIntervals * 5

    // Ensure percentage does not go below 80%
    percentage = Math.max(percentage, 80)

    // Returning remaining time in minutes and percentage
    return `${percentage}`
  }

  // Calculate percentage based on remaining time in minutes and SLA
  for (let i = 1; i <= sla; i++) {
    // Increment percentage by 10 for each additional SLA
    if (remainingTimeInMinutes >= i * 540)
      percentage = 100 + (i - 1) * 10
  }

  // Returning remaining time in minutes and percentage
  return `${percentage}`
}

export const progressBarColor = (sla: any, progressAt: any, isHariLibur) => {
  const percentage = calculatePercentageMode3(sla, progressAt, isHariLibur)
  if (percentage >= 100)
    return '#00ff00'
  else if (percentage >= 90)
    return '#ffff00'
  else if (percentage >= 85)
    return '#ffcc00'
  else if (percentage >= 80)
    return '#ff0000'
  else
    return '#ff0000'
}

export const progressBarWidth = (sla: any, progressAt: any, isHariLibur) => {
  const percentage = calculatePercentageMode3(sla, progressAt, isHariLibur)

  return { width: `${percentage}%` }
}

export const progressBarWidthIncident = (priority: any, progressAt: any, arrayLibur) => {
  const percentage = calculatePercentageMode3Incident(priority, progressAt, arrayLibur)

  return { width: `${percentage}%` }
}

export const progressBarColor2 = (sla: any) => {
  if (sla >= 100)
    return 'success'
  else if (sla >= 90)
    return 'warning'
  else if (sla >= 85)
    return 'warning'
  else if (sla >= 80)
    return 'error'
  else
    return 'error'
}

export const progressBarColorIncident = (priority: any, progressAt: any, arrayLibur) => {
  const percentage = calculatePercentageMode3Incident(priority, progressAt, arrayLibur)
  if (percentage >= 100)
    return '#00ff00'
  else if (percentage >= 90)
    return '#ffff00'
  else if (percentage >= 85)
    return '#ffcc00'
  else if (percentage >= 80)
    return '#ff0000'
  else
    return '#ff0000'
}
