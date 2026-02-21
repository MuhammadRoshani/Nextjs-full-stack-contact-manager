import User from "@/models/User";
import connectDB from "@/utils/connectDB";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { serialize } from "cookie";

export default async function handler(req, res) {
  // check method:
  // only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // validation required fields:

    const { email, password } = req.body;

    // we checked below every field must be filled not empty.
    if (!email || !password || !email.trim() || !password.trim()) {
      return res.status(422).json({ message: "All fields are required" });
      // unprocessable entity(422)
    }

    // email:(validate format)
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(normalizedEmail)
    ) {
      return res.status(422).json({ message: "Email is not valid" });
    }

    // connect to DataBase:
    await connectDB();

    // check email exist in DB:
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return (
        res
          .status(401)
          // unauthorized(401)
          .json({ message: "Email or Password is not valid. If you don't have an account, please register" })
      );
      // generic error for security (hacker don't know which one is false)
    }

    // compare password:
    // user.password second value of compare() in fact is that hashed password save in database, if we have user in database, save on user constant on some line top and we can access to his password field.
    const isValidPassword = await bcrypt.compare(password, user.password);
    // if our password in login form is equal to hashed password in database bring true in isValidPassword.
    if (!isValidPassword) {
      return res
        .status(401)
        .json({ message: "Email or Password is not valid" });
    }

    // on first value of token we save payload, we must save uniq value like email or id.

    // ensure secret exists:
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined");
    }

    // generate token:
    // what is token: in fact token is like entry key for access and go to routes on website(private) and every token has expiration date, until when active.
    const token = jwt.sign(
      // we use these values below in login client side page in ssr method, because we must send our userId as well.
      { email: user.email, userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      },
    );

    // set cookie:(httpOnly):
    res.setHeader(
      "Set-Cookie",
      serialize("token", token, {
        // js can't access to httpOnly values, only http and https protocol can access and prevent to XSS attacks.
        httpOnly: true,
        // it means / in all of the site page can access and use.
        path: "/",
        // expire of cookie, according to seconds(2hour).
        maxAge: 60 * 60 * 2,
        // prevent to CSRF attacks.
        sameSite: "strict",
        // for more security
        secure: process.env.NODE_ENV === "production",
      }),
    );

    res.status(200).json({ message: "Login successful" });
    // ok(200)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
