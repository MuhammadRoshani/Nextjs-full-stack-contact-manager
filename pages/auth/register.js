import Link from "next/link";
// we use this useable style for this page because more of our styles are the same.
import styles from "@/styles/AddContact.module.css";
import { FaRegEye, FaRegEyeSlash, FaSpinner } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import validateToken from "@/utils/auth";

export default function Register() {
  // this router for lead(redirect) to login page, after register successfully
  const router = useRouter();

  // showPassword:
  // this state below for eye icon that password show in input or hidden
  const [showPassword, setShowPassword] = useState(false);

  // formData:
  // this state for our save inputs values
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  // loading:
  const [loading, setLoading] = useState(false);

  // showPassHandler func:
  const showPassHandler = () => {
    setShowPassword(!showPassword);
  };

  // registerHandler func:
  const registerHandler = async (event) => {
    // prevent refresh:
    event.preventDefault();

    // Prevent multiple clicks on form
    if (loading) return;

    const { firstName, lastName, email, password } = formData;

    // normalized email:(its use to save email field in database, all characters small letters)
    const normalizedEmail = email.trim().toLowerCase();

    let errorMessage = "";

    // error validation (client side):
    if (!firstName || !lastName || !email || !password) {
      return toast.error("All fields are required");
    }

    // firstName:
    if (firstName.length < 3 || firstName.length > 20) {
      errorMessage +=
        "the firstName must be between 3 and 20 characters" + "\n";
    }

    // lastName:
    if (lastName.length < 3 || lastName.length > 20) {
      errorMessage += "the lastName must be between 3 and 20 characters" + "\n";
    }

    // email:
    if (!email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
      errorMessage += "email is not valid" + "\n";
    }

    // password:
    if (password.length < 8) {
      errorMessage += "password must be at least 8 chars" + "\n";
    }

    // show error:
    if (errorMessage) {
      return toast.error(errorMessage);
    }

    // show loading:
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ ...formData, email: normalizedEmail }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      // disappear loading:
      setLoading(false);

      // error handing validation (server side):
      if (
        res.status === 422 ||
        res.status === 409 ||
        res.status === 405 ||
        res.status === 401 ||
        res.status === 500
      ) {
        return toast.error(data.message, { duration: 5000 });
      }

      // success message(created):
      toast.success(data.message, { duration: 5000 });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      });
      // here after register we lead(redirect) to login page
      setTimeout(() => {
        router.replace("/auth/login");
      }, 1000);
      // network error:
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("network error check your internet");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <form onSubmit={registerHandler}>
          {/* first input: */}
          <input
            autoFocus
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
            value={formData.firstName}
            type="text"
            placeholder="firstName"
          />
          {/* second input */}
          <input
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
            value={formData.lastName}
            type="text"
            placeholder="lastName"
          />
          {/* third input */}
          <input
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            value={formData.email}
            type="text"
            placeholder="email"
          />
          <div className={styles.password}>
            {/* forth input */}
            <input
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              value={formData.password}
              type={showPassword ? "text" : "password"}
              placeholder="password"
            />
            {showPassword ? (
              <FaRegEyeSlash size="20px" onClick={showPassHandler} />
            ) : (
              <FaRegEye size="20px" onClick={showPassHandler} />
            )}
          </div>
          <button type="submit" disabled={loading}>
            register
            {loading && <FaSpinner size="20px" className={styles.spin} />}
          </button>
          <div className={styles.notRegistered}>
            Already registered?
            <Link href="/auth/login">
              <span> Login</span>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

// prevent go to register page after register
// redirect to dashboard page by server side method:
export async function getServerSideProps(context) {
  const payload = await validateToken(context);
  // when user login, token is valid
  if (payload) {
    return {
      redirect: { destination: "/dashboard" },
    };
  }
  return {
    props: {},
  };
}
