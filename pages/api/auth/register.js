import User from "@/models/User";
import connectDB from "@/utils/connectDB";
import bcrypt from "bcrypt";

export default async function handler(req, res) {
  // check method:
  // if our method not post, in here Immediately return happen and not going to other line below, in here send res and closed this block.
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method Not Allowed" });
  }

  try {
    // validation:
    // one little note for setting our role in database, which on is admin and which user? first user to register become a admin and other user after that want to register are simple user.
    const { firstName, lastName, email, password } = req.body;

    // we checked below every field must be filled not empty.
    // empty fields(all):
    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      return res.status(422).json({ message: "All fields are required" });
      // unprocessable entity(422)
    }

    // firstName:
    const trimmedFirstName = firstName.trim();
    if (trimmedFirstName.length < 3 || trimmedFirstName.length > 20) {
      return res
        .status(422)
        .json({ message: "The firstName must be between 3 and 20 characters" });
    }

    // checked our user put some true on firstName value avoid put number or special character.
    // ✅✅only one space is allowed in regex pattern below for firstName and lastName, for that time user his name like muhammad reza , just accepted space in middle of name, first and end space rejection not acceptable.
    if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(trimmedFirstName)) {
      return res
        .status(422)
        .json({ message: "The firstName must contain only letters" });
    }

    //  lastName:
    const trimmedLastName = lastName.trim();
    if (trimmedLastName.length < 3 || trimmedLastName.length > 20) {
      return res
        .status(422)
        .json({ message: "The lastName must be between 3 and 20 characters" });
    }

    // checked our user put some true on lastName value avoid put number or special character.
    if (!/^[A-Za-z]+(?:\s[A-Za-z]+)*$/.test(trimmedLastName)) {
      return res
        .status(422)
        .json({ message: "The lastName must contain only letters" });
    }

    // password:(checked before we send request and convert to hashed password in here return and send response and not go to register section code below, solve hash pass problem that a few line below i explain in note)
    if (password.length < 8 || password.length > 25) {
      return res
        .status(422)
        .json({ message: "The Password must be between 8 and 25 characters long" });

      // 💯note:
      // we must prevent to hash password, because we set in our models(schema) minLength 8 and maxLength 25, minlength: if user set password 12345 this password 5 character long and we have error, must be 8 characters but our code convert to hash password more than 5 character and register to database successfully and we must prevent that.
    }

    // email:

    // allows letters, numbers and . _ % + - before @
    // requires a valid domain after @
    // requires a dot and at least 2 letters for domain extension (.com, .ir, .net)
    // example valid: test@gmail.com
    const normalizedEmail = email.trim().toLowerCase();

    if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(normalizedEmail)
    ) {
      return res.status(422).json({ message: "Email is not valid" });
    }

    // connect to DataBase:
    await connectDB();

    // check email exist(duplicate):
    // checked our email from database(collection) and that email we bring out from req.body(👆) equal or not, if is equal prevent to register.
    const isUserExist = await User.findOne({ email: normalizedEmail });
    if (isUserExist) {
      return res.status(409).json({ message: "Email is already registered" });
      // Conflict(409)
    }

    // hash password:
    // by using bcrypt package we convert our password to safe password(encryption), it means convert password to long nonsense string, for when our database hacked for prevent to access hacker to users password.
    const hashedPassword = await bcrypt.hash(password, 10);
    // about that number salt:(10 : default value), we give whatever number is bigger our password is safe and stronger but the speed decreases and whatever our number is smaller our password more unsafe but instead speed increase.

    // determine role: first user = admin, others = user
    // first user when want to register become admin(role), another user want to register become simple user(role).
    const countUsers = await User.countDocuments();
    // countDocument method from mongoDB at top, give us all user count number.

    // register:
    // why not use req.body below because for security, when who want to send request can't access to role and put role to admin for example by postman app.
    await User.create({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: normalizedEmail,
      password: hashedPassword,
      role: countUsers > 0 ? "user" : "admin",

      // we checked our number count of member in database if more than zero, role equal to user, if not, number count is less that zero that user must be admin
    });
    res.status(201).json({ message: "User register successfully" });
    // created(201)
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}
