import { useState } from "react";
import { useRouter } from "next/router";
import { FaSpinner } from "react-icons/fa";
import toast from "react-hot-toast";
import styles from "@/styles/AddContact.module.css";
import validateToken from "@/utils/auth";

export default function AddContact({ userId }) {
  // for redirect to contacts page:
  const router = useRouter();
  // loading:
  // this is state for our loading that when we send our data to database, in fact after we clicked on add contact button from time until our data goes to server and database we show some loading for better UI on add page.
  const [loading, setLoading] = useState(false);

  // formdata:
  // this state below for save our data from form.
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    age: "",
    gender: "",
    phone: "",
  });

  // addContactHandler func:
  const addContactHandler = async (e) => {
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
      return toast.error("please fill in all the fields");
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
      // send request:
      const res = await fetch("/api/contacts", {
        method: "POST",
        // we access userId from token values.
        // we must send user id because later we needed, what user make or better say add what contact, in fact to separate our contact by every users category.
        // in fact again, this operation it happens behind the scenes, because we have not userId field on our form but we send it in any way😂😂.
        body: JSON.stringify({ ...formData, userId }),
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

        //// we use split below for personalization error message, cell 0 and 1, Do not display and display only cell 2, and one note : (":") this converts it to array and we can from place to place between our cells (and error message it comes from Models directory), in fact in here below with : character divide by small pieces for ex : (muhammad : roshani : 25) , in below we write [2] in code, it means only show 25 in example top line.

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

      toast.success("new contact added to db", { duration: 5000 });
      // here we reset our form after we send our data in database , in fact after we clicked on add contact button form reset.
      setFormData({
        firstName: "",
        lastName: "",
        age: "",
        gender: "",
        phone: "",
      });
      // redirect to contacts page after add new contact successful.
      setTimeout(() => {
        router.replace("/contacts");
      }, 1100);
      // network error:
    } catch (err) {
      setLoading(false);
      toast.error("network error check your internet");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <form onSubmit={addContactHandler}>
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
            add contact
            {loading ? <FaSpinner size="20px" className={styles.spin} /> : ""}
          </button>
        </form>
      </div>
    </>
  );
}

//✅✅✅
// if we have valid token we can access to this route same as dashboard.

// check token in request header on cookies exist, by SSR method:
export async function getServerSideProps(context) {
  // we define our payload have what value in login from api directory(email, id, role) we access these three value.
  const payload = await validateToken(context);
  if (!payload) {
    return {
      redirect: { destination: "/auth/login", permanent: false },
    };
  }
  // we bring out userId from valid token, in fact this id is the id on User model in collection db.
  // we must access userId part from formData state because must send id with another information.
  return {
    props: { userId: payload.userId },
    // we access this userId on top of the page on main function we destructuring these.👆
  };
}
// 💯💯💯
// two routes are private or better say that protection routes
// 1:/dashboard
// 2:/contacts/add
// only when have valid token after success login on our cookies, can access to this routes, and when have token, that time our login be successful our token created on cookie and access to this token from application section on our browser.

// in fact token is our key to can access to private or protection routes.
