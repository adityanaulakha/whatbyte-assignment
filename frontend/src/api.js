const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function getToken() {
  return localStorage.getItem('access');
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      `Cannot reach API at ${API_URL}. Check that the backend is running and VITE_API_URL is correct.`
    );
  }

  if (res.status === 204) {
    return null;
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.detail ||
      (Array.isArray(data.errors) && data.errors.map((e) => e.message).join(', ')) ||
      `Request failed (${res.status}).`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  register: (body) =>
    request('/api/auth/register/', { method: 'POST', body: JSON.stringify(body) }),
  login: (body) =>
    request('/api/auth/login/', { method: 'POST', body: JSON.stringify(body) }),

  listPatients: () => request('/api/patients/'),
  getPatient: (id) => request(`/api/patients/${id}/`),
  createPatient: (body) =>
    request('/api/patients/', { method: 'POST', body: JSON.stringify(body) }),
  updatePatient: (id, body) =>
    request(`/api/patients/${id}/`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePatient: (id) => request(`/api/patients/${id}/`, { method: 'DELETE' }),

  listDoctors: () => request('/api/doctors/'),
  getDoctor: (id) => request(`/api/doctors/${id}/`),
  createDoctor: (body) =>
    request('/api/doctors/', { method: 'POST', body: JSON.stringify(body) }),
  updateDoctor: (id, body) =>
    request(`/api/doctors/${id}/`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteDoctor: (id) => request(`/api/doctors/${id}/`, { method: 'DELETE' }),

  listMappings: () => request('/api/mappings/'),
  createMapping: (body) =>
    request('/api/mappings/', { method: 'POST', body: JSON.stringify(body) }),
  getDoctorsForPatient: (patientId) => request(`/api/mappings/${patientId}/`),
  deleteMapping: (id) => request(`/api/mappings/${id}/`, { method: 'DELETE' }),
};
