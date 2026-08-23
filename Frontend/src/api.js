const BASE = ''

export async function apiFetch(path, token, options = {}) {
  const headers = { ...options.headers }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const response = await fetch(BASE + path, { ...options, headers })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const text = await response.text()
      if (text) message = text
    } catch { }
    throw new Error(message)
  }

  if (response.status === 204) return null
  const ct = response.headers.get('content-type') || ''
  if (ct.includes('application/json')) return response.json()
  return null
}

export const loginStudent = (username, password) =>
  apiFetch('/api1/Student/login', null, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

export const registerStudent = (formData) =>
  apiFetch('/api1/Student/register', null, {
    method: 'POST',
    body: formData,
  })

export const loginAdmin = (username, password) =>
  apiFetch('/api2/Admin/login', null, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

export const registerAdmin = (username, password) =>
  apiFetch('/api2/Admin/add', null, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })

export const getAllStudents = (token) =>
  apiFetch('/api1/Student/all', token)

export const getStudent = (token, rollNumber) =>
  apiFetch(`/api1/Student/retrieve?rn=${encodeURIComponent(rollNumber)}`, token)

export const addStudent = (token, formData) =>
  apiFetch('/api1/Student/add', token, { method: 'POST', body: formData })

export const updateStudent = (token, rollNumber, formData) =>
  apiFetch(`/api1/Student/update?rn=${encodeURIComponent(rollNumber)}`, token, {
    method: 'PUT',
    body: formData,
  })

export const deleteStudent = (token, rollNumber) =>
  apiFetch(`/api1/Student/del?rn=${encodeURIComponent(rollNumber)}`, token, {
    method: 'DELETE',
  })

export const getCodingProfile = (token, rollNumber) =>
  apiFetch(`/api3/CodeProfile/get?rn=${encodeURIComponent(rollNumber)}`, token)

export const addCodingProfile = (token, profile) =>
  apiFetch('/api3/CodeProfile/add', token, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })

export const updateCodingProfile = (token, rollNumber, profile) =>
  apiFetch(`/api3/CodeProfile/update?rn=${encodeURIComponent(rollNumber)}`, token, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  })

export const deleteCodingProfile = (token, rollNumber) =>
  apiFetch(`/api3/CodeProfile/delete?rn=${encodeURIComponent(rollNumber)}`, token, {
    method: 'DELETE',
  })

export const uploadCertificate = (token, rollNumber, file, desc) => {
  const fd = new FormData()
  fd.append('file', file)
  return apiFetch(
    `/api4/Certificate/addOne?rn=${encodeURIComponent(rollNumber)}&desc=${encodeURIComponent(desc || file.name)}`,
    token,
    { method: 'PUT', body: fd }
  )
}

export const deleteCertificate = (token, rollNumber, desc) =>
  apiFetch(
    `/api4/Certificate/deleteOne?rn=${encodeURIComponent(rollNumber)}&desc=${encodeURIComponent(desc)}`,
    token,
    { method: 'DELETE' }
  )

export const getCertificateUrl = (id) => `/api4/Certificate/get/${id}`
export const getCertificateDownloadUrl = (id) => `/api4/Certificate/download/${id}`

export const uploadAchievement = (token, rollNumber, file, desc) => {
  const fd = new FormData()
  fd.append('file', file)
  return apiFetch(
    `/api5/Achievement/addOne?rn=${encodeURIComponent(rollNumber)}&desc=${encodeURIComponent(desc || file.name)}`,
    token,
    { method: 'PUT', body: fd }
  )
}

export const deleteAchievement = (token, rollNumber, desc) =>
  apiFetch(
    `/api5/Achievement/deleteOne?rn=${encodeURIComponent(rollNumber)}&desc=${encodeURIComponent(desc)}`,
    token,
    { method: 'DELETE' }
  )

export const getAchievementUrl = (id) => `/api5/Achievement/get/${id}`
export const getAchievementDownloadUrl = (id) => `/api5/Achievement/download/${id}`
