import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { useState } from "react";
import styles from "@/styles/AddContact.module.css";
import Contact from "@/models/Contact";
import { FaSpinner } from "react-icons/fa";

// here below we get contact and put in formData state
export default function EditContact({ contact }) {
  // we must access to _id for edit the contact that clicked on pen icon, in useRouter(query) : we can access the _id.
  const router = useRouter();
  const { _id } = router.query;

  // here below we get all data such age, gender and... and put all this value to our input to show in edit page UI and at least we can edit them.
  const [formData, setFormData] = useState(contact);

  const [loading, setLoading] = useState(false);

  // editContactHandler func, one little note: every work with database like edit or delete we must use async function
  const editContactHandler = async (e) => {
    // Prevent default behavior on form because if we click on btn, page refreshed, and we want prevent that.
    e.preventDefault();

    // Prevent multiple clicks on form
    if (loading) return;

    // we checked all field on our form is empty or not and they should not be empty we must write all field.
    let errorMessage = "";
    const { firstName, lastName, age, gender, phone } = formData;
    // with this validation below, we prevent to send request to server or db, first validate our data in client side if all fields value is right one, after that request sended to server, better say that we prevent send useless request to server.

    // one note from before in js : empty string it means false
    // validation of clint side (Front-End):
    if (!firstName || !lastName || !age || !gender || !phone) {
      // if have not value execute this:
      return toast.error("please fill in all fields");
    }

    // firstName validation:
    if (firstName.length < 3 || firstName.length > 20) {
      errorMessage +=
        "the firstName must be between 3 and 20 characters" + "\n";
    }

    // lastName validation:
    if (lastName.length < 3 || lastName.length > 20) {
      errorMessage += "the lasName must be between 3 and 20 characters" + "\n";
    }

    // age validation:
    if (age < 15) {
      errorMessage += "the age must be greater than or equal to 15" + "\n";
    }

    // phone validation:
    if (phone.length > 11 || !phone.match(/^09\d{9}$/)) {
      errorMessage += "the phone number is not valid" + "\n";
    }

    // errorMessage:
    // in here if we have errors because we write return in code , after this code below not executed.
    if (errorMessage) {
      return toast.error(errorMessage);
    }
    try {
      // if all have values true in fields execute this code below:
      // here we show loading
      setLoading(true);
      // we connect to db here:
      const res = await fetch(`/api/contacts/${_id}`, {
        method: "PUT",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      // after our data send successfully or we have some error our loading is disappeared.
      setLoading(false);

      // we checked here below all fields and all values are valid data or not for ex : phone number start with 09 if user start with 08 we shows are errors by status code that develop on api directory.

      // validation error:
      if (res.status === 422) {
        // we show our error from value of data in some line at top.
        // and also we write return that here execute this code below and not go to next line that means success toast.

        return toast.error(data.message);
      }

      // duplicate phone error:
      if (res.status === 409) {
        return toast.error(data.message);
      }

      // internal server error:
      if (res.status === 500) {
        return toast.error(data.message);
      }

      toast.success("contact updated successfully", { duration: 5000 });

      // we here below redirect to main page or better say go to contacts page after we edit our contact in 2s
      // why immediately do redirect because is a bad ui ux we use setTimeout for delay it.
      setTimeout(() => {
        router.replace("/contacts");
      }, 900);

      // network error:
    } catch (err) {
      setLoading(false);
      toast.error("network error check your internet");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <form onSubmit={editContactHandler}>
          {/* first input */}
          <input
            autoFocus
            type="text"
            placeholder="firstName"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
          {/* second input */}
          <input
            type="text"
            placeholder="lastName"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />
          {/* third input */}
          <input
            type="number"
            placeholder="age"
            value={formData.age}
            onChange={(e) => setFormData({ ...formData, age: e.target.value })}
          />
          {/* forth input or better say options */}
          <select
            value={formData.gender}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
          >
            <option value="" hidden disabled>
              gender
            </option>
            <option value="male">male</option>
            <option value="female">female</option>
          </select>
          {/* fifth input */}
          <input
            type="text"
            placeholder="phone"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
          <button type="submit" disabled={loading}>
            edit contact
            {loading ? <FaSpinner size="20px" className={styles.spin} /> : ""}
          </button>
        </form>
      </div>
    </>
  );
}

// localhost:port(3000)/contact/edit/ here dynamic for id (here dependent on what contact we clicked on edit icon and remind you every contact have uniq id like National number😁)

// we have access our id for each contact, in this code below we get our data with SSR method from database and put it in edit page form for editing our each contacts.

export async function getServerSideProps(context) {
  // in server site we can access to id with params, against client side we use useRouter.
  const { _id } = context.params;
  // again we get our data directly from database
  // with lean method below we can convert mongoDB document to simple js object, because we write query to get data for that we get data with mongoDB format we must change it.
  const contact = await Contact.findById(_id).select("-_id").lean();
  // we use select method for remove or better say minus it, except this field another field is ok be there don't go any where😂 and at all we solve JSON serializable error.

  return {
    // again we have here JSON serializable error: (because json format can't read all values some special values only.)
    // what field bring problem, well done👌 _id(ObjectId) in mongoDB, this field can't convert to json, in some line up we solve this problem with select method.
    props: { contact: JSON.parse(JSON.stringify(contact)) },
  };
}
