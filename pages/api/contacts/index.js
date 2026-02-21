import Contact from "@/models/Contact";
import connectDB from "@/utils/connectDB";
import validateToken from "@/utils/auth";
import generateFilter from "@/utils/generateFilter";

export default async function handler(req, res) {
  // get or receive userId from token instead of query string for security.
  
  const payload = await validateToken({ req });
  if (!payload) {
    return res.status(401).json({ message: "unauthorized" });
  }

  await connectDB();

  const userId = payload.userId;
  // get:
  if (req.method === "GET") {
    // query string: url (we use this for, ability of sort and searching the name, family and gender in our forms)

    // search by gender and fName or lName in our url: http://localhost:3000/api/contacts?key=value | ?gender=male or female

    // req.query to deliver a object.
    const { gender, search } = req.query;
    // we get id from token
    const filter = generateFilter({ gender, search }, userId);
    const contacts = await Contact.find(filter);
    res.status(200).json(contacts);
  }

  // post:
  else if (req.method === "POST") {
    // create method in fact is insertOne or many in MONGOSH
    try {
      await Contact.create({ ...req.body, userId });
      // when we want add new contact in db we use 201 status code (created).
      res.status(201).json({ message: "new contact added to db" });
    } catch (error) {
      // error handling:

      // duplicate phone error :
      // all number in db must be unique.

      // code error 11000 is in mongoDB (duplicate number)
      if (error.code === 11000) {
        // and status code 409 it means we have conflict.
        return res.status(409).json({
          message: "this number is already registered",
        });
      }

      // validation error:
      if (error.name === "ValidationError") {
        let errorMessage = "";

        // if we have more than a few errors, to display correctly in UI , write this code below.
        // we must convert our object to array that we can execute map method on them.
        // we must go to error object after that errors and all cells and show error.message on UI.
        Object.values(error.errors).map(
          (error) => (errorMessage += error.message + `\n`),
        );
        // when we send invalid data , we use 422 status code (unprocessable entity).
        return res.status(422).json({ message: errorMessage });
      }

      res.status(500).json({ message: "internal server error" });
    }
  } else {
    res.status(405).json({ message: "method not Allowed" });
  }
  // this code at top it means other than post and get method another method like put or delete are not allowed to send request.
}
