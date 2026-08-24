import ApiError from "../utils/ApiError.js";

export function validate(schema, source = "body") {
  return (req, res, next) => {
    const dataToValidate =
      source === "query"
        ? req.query
        : source === "params"
          ? req.params
          : req.body;

    const result = schema.safeParse(dataToValidate);

    if (!result.success) {
      const errorMessages = result.error.issues.map((issue) => {
        const field = issue.path.join(".");
        return `${field}: ${issue.message}`;
      });

      const mensaje = errorMessages.join(", ");

      return next(new ApiError(mensaje, 400));
    }

    if (source === "query") {
      req.validatedQuery = result.data;
    } else if (source === "params") {
      req.validatedParams = result.data;
    } else {
      req.body = result.data;
    }

    next();
  };
}
