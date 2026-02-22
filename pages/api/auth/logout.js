import { serialize } from "cookie";

export default async function handler(req, res) {
  // check method:
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // destroy cookie:
    res.setHeader(
      "Set-Cookie",
      serialize("token", "", {
        // js can't access to httpOnly values, only http and https protocol can access and prevent to XSS attacks.
        httpOnly: true,
        // it means / in all of the site page can access and use.
        path: "/",
        // expire of cookie, according to seconds (0 remove).
        maxAge: 0,
        expires: new Date(0),
        // prevent to CSRF attacks.
        sameSite: "lax",
        // for more security always https protocol.
        secure: process.env.NODE_ENV === "production",
      }),
    );
    return res.status(200).json({ message: "user logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "server error" });
  }
}
