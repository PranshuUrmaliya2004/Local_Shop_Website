import jwt from "jsonwebtoken";

export default function requireAdmin(request, response, next) {
  const authorization = request.headers.authorization || "";
  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).json({ message: "Please sign in as an admin." });
  }

  try {
    request.admin = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return response.status(401).json({ message: "Your session is invalid or expired. Sign in again." });
  }
}
