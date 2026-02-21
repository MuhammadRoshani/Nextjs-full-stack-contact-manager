import styles from "@/components/contact/contactItem.module.css";
import { AiFillEdit } from "react-icons/ai";
import { MdDeleteForever } from "react-icons/md";
import { MdOutlineFavoriteBorder } from "react-icons/md";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import Link from "next/link";

export default function ContactItem({
  _id,
  firstName,
  lastName,
  age,
  gender,
  phone,
  favorite,
  contacts,
  setContacts,
}) {
  // deleteContactHandler func:
  const deleteContactHandler = async (_id) => {
    // we use sweetalert2 for confirm box for delete contact, in fact ask question you sure remove or not.
    const result = await Swal.fire({
      title: "Delete contact?",
      text: "Are you sure you want to delete this contact?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#e53935",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Yes, delete",
      cancelButtonText: "Cancel",
    });
    // this code below for question box if user clicked cancel do nothing and exit and if user clicked on yes remove be done
    if (!result.isConfirmed) return;
    // handle error:(if trash icon not work for any reason)
    try {
      // we send request to our api path is api/contact/[_id] directory.
      const res = await fetch(`/api/contacts/${_id}`, { method: "DELETE" });

      const data = await res.json();

      if (res.status === 200) {
        Swal.fire("Deleted!", data.message, "success");

        // this code below for delete our single contact when we clicked on trash icon from page(UI) to be deleted immediately fot that thing we need value of contacts and his setter from state in contacts directory(index.js).
        // in fact contacts is an array and we can use filter method(in contacts we save all values)
        // in filter method checked if our both _id are Opposite, both return to filteredContacts and show on ui, if both id equal together return not happen and removed from ui and state.
        // in fact for not to be confused in this code below contact._id in fact that id in database and _id is id for trash icon, in general they are compared to each other(if Opposite returned).
        const filteredContacts = contacts.filter(
          (contact) => contact._id !== _id,
        );
        setContacts(filteredContacts);
      }

      if (res.status === 404) {
        Swal.fire("Error", data.message, "error");
      }
    } catch (error) {
      toast.error("server error");
    }
  };

  // likeContactHandler func:
  const likeContactHandler = async () => {
    try {
      const res = await fetch(`/api/contacts/${_id}`, { method: "PATCH" });
      const data = await res.json();

      if (res.status == 200) {
        if (data.favorite) {
          toast.success("Contact added to favorite list");
        } else {
          toast("Contact removed from favorite list");
        }
      }

      if (res.status == 404) {
        toast.error(data.message);
      }
      // this code below for that time we liked our contact, at the same moment our component rendered and immediately our heart icon become pink.
      const likedContacts = contacts.map((contact) => {
        if (contact._id === _id) {
          contact.favorite = !contact.favorite;
        }
        return contact;
      });
      setContacts(likedContacts);
    } catch (error) {
      toast.error("server error");
    }
  };

  return (
    <>
      <div className={styles.card}>
        {/* Specifications: on left: */}

        {/* first field : */}
        <div className="name">
          <b>firstName :</b> {firstName}
        </div>
        {/* second field : */}
        <div className="family">
          <b>lastName :</b> {lastName}
        </div>
        {/* third field : */}
        <div className="age">
          <b>age :</b> {age}
        </div>
        {/* forth field : */}
        <div className="gender">
          <b>gender :</b> {gender}
        </div>
        {/* fifth field : */}
        <div className="phone">
          <b>phone :</b> {phone}
        </div>

        <div className={styles.icons}>
          {/* icons on right: */}

          {/* delete icon */}
          <div className={styles.delete}>
            <MdDeleteForever onClick={() => deleteContactHandler(_id)} />
          </div>
          {/* edit icon */}
          <div className={styles.edit}>
            <Link href={`/contacts/edit/${_id}`}>
              <AiFillEdit />
            </Link>
          </div>
          {/* favorite icon */}
          <div className={styles.favorite}>
            {/* here below we decide color of icon what color by value of favorite in our database if true being pink */}
            <MdOutlineFavoriteBorder
              fill={favorite ? "#ff54b2" : "black"}
              onClick={() => likeContactHandler(_id)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
