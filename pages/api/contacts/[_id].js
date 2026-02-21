// this dynamic route for get, delete, edit and favorite(like) single contact by id.
import Contact from "@/models/Contact";
import connectDB from "@/utils/connectDB";
import { isValidObjectId } from "mongoose";

export default async function handler(req, res) {
  await connectDB();
  // this _id name come from [ _id ] in api/contacts folder, below.
  const { _id } = req.query;

  // Validation ID : (we checked our id from db is valid or not)
  if (isValidObjectId(_id)) {
    try {
      // get:
      if (req.method === "GET") {
        const contact = await Contact.findById(_id);
        // we checked id exits in db or not (for sometimes objectId id is valid but we removed from our db)
        if (contact) {
          return res.status(404).json(contact);
        } else {
          return res.json({ message: "contact not found" });
        }
      }

      // delete:
      else if (req.method === "DELETE") {
        // in here below we for that time we deleted contact from db and after that with that id we deleted before, again send DELETE request first time we delete comeback our object and save on result true but again send request comeback with null that means in false.
        const result = await Contact.findByIdAndDelete(_id);
        if (result) {
          return res
            .status(200)
            .json({ message: "contact deleted successfully" });
        } else {
          return res.status(404).json({ message: "contact not found" });
        }
      }

      // put(edit all fields):
      else if (req.method === "PUT") {
        const result = await Contact.findByIdAndUpdate(_id, req.body);
        if (result) {
          res.status(200).json({ message: "contact updated successfully" });
        } else {
          res.status(404).json({ message: "contact not found" });
        }
      }
      // patch:(for favorite contacts)
      else if (req.method === "PATCH") {
        const contact = await Contact.findOne({ _id });
        if (!contact) {
          return res.status(404).json({ message: "contact not found" });
        }
        // value of favorite field in db become opposite change between true and false for change color icon and show in favorite list
        contact.favorite = !contact.favorite;
        await contact.save();
        // here below gives value from db true or false if was true show this message Contact added to favorite list, if false show another message.
        res.status(200).json({ favorite: contact.favorite });
      } else {
        return res.status(405).json({ message: "method not allowed" });
      }
    } catch (error) {
      console.log(error);
      return res.status(500).json({ message: "server error" });
    }
  } else {
    res.status(400).json({ message: "objectId is not valid" });
    // bad request(400)
  }
}
