import { verify } from "jsonwebtoken";

export default async function handler(req, res) {
  // check method:
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
    // 405(method not allowed)
  }

  // check token exist on cookies headers or not:(what time we have token? when user login)
  const { token } = req.cookies;

  // user not authenticated:
  if (!token) {
    return res.status(401).json({ message: "unauthorized" });
  }

  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined");
  }

  // if token exist, verify token:
  try {
    const payload = verify(token, process.env.JWT_SECRET);
    return res.status(200).json({ message: "authenticated" });
  } catch (error) {
    return res.status(401).json({ message: "unauthorized" });
  }
}

// to this route we checked our user is login or not, or better say that checked authentication.
