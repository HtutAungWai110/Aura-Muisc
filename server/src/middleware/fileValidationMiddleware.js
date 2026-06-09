export default function fileValidationMiddleware(options = {}) {
  return (req, res, next) => {
    const { field, multiple = false, allowedMimetypes = [], maxSize = 0 } = options;

    if (multiple) {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ message: `No files uploaded for field ${field}` });
      }

      // Validate each file
      for (const file of req.files) {
        if (allowedMimetypes.length > 0 && !allowedMimetypes.includes(file.mimetype)) {
          return res.status(400).json({ message: `Invalid file type for file ${file.originalname}` });
        }
        if (maxSize > 0 && file.size > maxSize) {
          return res.status(400).json({ message: `File ${file.originalname} exceeds size limit` });
        }
      }
    } else {
      if (!req.file) {
        return res.status(400).json({ message: `No file uploaded for field ${field}` });
      }

      if (allowedMimetypes.length > 0 && !allowedMimetypes.includes(req.file.mimetype)) {
        return res.status(400).json({ message: `Invalid file type for file ${req.file.originalname}` });
      }
      if (maxSize > 0 && req.file.size > maxSize) {
        return res.status(400).json({ message: `File ${req.file.originalname} exceeds size limit` });
      }
    }

    next();
  };
}