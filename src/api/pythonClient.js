// src/api/pythonClient.js
const BASE = import.meta.env.VITE_PYTHON_API_URL || '/api/python'

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  return res.json()
}

export const pythonApi = {
  // 1:1 — compara duas fotos diretamente
  compareFaces: (file1, file2) => {
    const fd = new FormData()
    fd.append('image1', file1)
    fd.append('image2', file2)
    return request('/compare', { method: 'POST', body: fd })
  },

  // 1:N — busca no banco de embeddings
  searchFace: (file, topK = 5) => {
    const fd = new FormData()
    fd.append('image', file)
    fd.append('top_k', topK)
    return request('/recognize', { method: 'POST', body: fd })
  },

  // Reconstrói o índice FAISS
  buildIndex: () => request('/index/build', { method: 'POST' }),

  // Status do serviço
  health: () => request('/health'),
}
