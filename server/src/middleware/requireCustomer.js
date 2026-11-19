import jwt from "jsonwebtoken";

export default function requireCustomer(request, response, next) {
  const [scheme, token] = (request.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({ message: "Please sign in to continue." });
  }
  try {
    request.customer = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return response.status(401).json({ message: "Your session has expired. Please sign in again." });
  }
}
