// Validates body / query / params with Zod and replaces them with parsed
// values. ZodErrors are forwarded to errorHandler for a uniform 400 response.
export const validate = (schemas) => (req, res, next) => {
  try {
    if (schemas.body) req.body = schemas.body.parse(req.body);
    if (schemas.query) {
      // Express 5 makes req.query a getter, so store the parsed copy separately.
      req.validQuery = schemas.query.parse(req.query);
    }
    if (schemas.params) req.params = schemas.params.parse(req.params);
    next();
  } catch (err) {
    next(err);
  }
};
