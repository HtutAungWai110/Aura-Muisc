export default function paramValidationMiddleware(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.params);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: result.error.format(),
      });
    }

    next();
  };
}