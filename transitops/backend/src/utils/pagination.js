/**
 * Utility helper to parse and compute pagination offsets and limits.
 * @param {object} query - Express request query object
 * @returns {object} { page, limit, skip, take }
 */
export const getPagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || 1);
  const limit = Math.max(1, Math.min(100, parseInt(query.limit, 10) || 10)); // Cap limit at 100
  
  const skip = (page - 1) * limit;
  const take = limit;

  return {
    page,
    limit,
    skip,
    take
  };
};

/**
 * Utility helper to build paginated metadata response objects.
 * @param {number} totalItems - Total matching records in database
 * @param {number} page - Current requested page number
 * @param {number} limit - Current requested records limit per page
 * @returns {object} Standard pagination metadata
 */
export const getPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    totalItems,
    totalPages,
    currentPage: page,
    limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};
