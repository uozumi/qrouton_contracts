export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}/${month}/${day}`;
};

export const formatContractPeriod = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startYear = start.getFullYear().toString().slice(-2);
  const startMonth = (start.getMonth() + 1).toString().padStart(2, '0');
  
  const endYear = end.getFullYear().toString().slice(-2);
  const endMonth = (end.getMonth() + 1).toString().padStart(2, '0');
  
  return `${startYear}/${startMonth}〜${endYear}/${endMonth}`;
}; 