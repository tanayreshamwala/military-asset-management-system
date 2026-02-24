export const getStatusColor = (status) => {
  const colors = {
    success: "#52c41a",
    error: "#f5222d",
    warning: "#faad14",
    info: "#1890ff",
  };
  return colors[status] || "#000";
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatDateTime = (date) => {
  return new Date(date).toLocaleString("en-US");
};

export const isAuthorized = (userRole, allowedRoles) => {
  return allowedRoles.includes(userRole);
};
