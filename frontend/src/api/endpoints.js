import api from "./client.js";

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (email, password) => api.post("/auth/login", { email, password }),
  getMe: () => api.get("/auth/me"),
};

export const usersAPI = {
  getAll: (page = 1, limit = 10) =>
    api.get("/users", { params: { page, limit } }),
  create: (userData) => api.post("/users", userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export const basesAPI = {
  getAll: (page = 1, limit = 10) =>
    api.get("/bases", { params: { page, limit } }),
  create: (baseData) => api.post("/bases", baseData),
  update: (id, baseData) => api.put(`/bases/${id}`, baseData),
  delete: (id) => api.delete(`/bases/${id}`),
};

export const assetsAPI = {
  getAll: (page = 1, limit = 10) =>
    api.get("/assets", { params: { page, limit } }),
  create: (assetData) => api.post("/assets", assetData),
  update: (id, assetData) => api.put(`/assets/${id}`, assetData),
  delete: (id) => api.delete(`/assets/${id}`),
};

export const inventoryAPI = {
  getInventory: (baseId) => api.get(`/inventory/${baseId}`),
  setOpeningBalance: (data) => api.put("/inventory/opening-balance", data),
  recordPurchase: (data) => api.post("/inventory/purchases", data),
  getPurchases: (baseId, page = 1, limit = 10) =>
    api.get("/inventory/purchases", { params: { baseId, page, limit } }),
  recordTransfer: (data) => api.post("/inventory/transfers", data),
  getTransfers: (baseId, page = 1, limit = 10) =>
    api.get("/inventory/transfers", { params: { baseId, page, limit } }),
  assignAsset: (data) => api.post("/inventory/assignments", data),
  getAssignments: (baseId, page = 1, limit = 10) =>
    api.get("/inventory/assignments", { params: { baseId, page, limit } }),
  recordExpenditure: (data) => api.post("/inventory/expenditures", data),
  getExpenditures: (baseId, page = 1, limit = 10) =>
    api.get("/inventory/expenditures", { params: { baseId, page, limit } }),
};

export const dashboardAPI = {
  getMetrics: (baseId) => api.get(`/dashboard/${baseId}`),
};

export const auditAPI = {
  getLogs: (filters = {}) => api.get("/audit-logs", { params: filters }),
};
