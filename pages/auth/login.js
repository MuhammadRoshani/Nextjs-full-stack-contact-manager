import Link from "next/link";
// we use this useable style for this page because more of our styles in page are the same.
import styles from "@/styles/AddContact.module.css";
import { FaRegEye, FaRegEyeSlash, FaSpinner } from "react-icons/fa";
import { useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import validateToken from "@/utils/auth";

export default function Login({ setIsAuthenticated }) {
  // this state below for eye icon that password show in input or hidden
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();

  // email:
  const [email, setEmail] = useState("");
  // password
  const [password, setPassword] = useState("");

  // loading:
  const [loading, setLoading] = useState(false);

  // showPassHandler func:
  const showPassHandler = () => {
    setShowPassword(!showPassword);
  };

  // loginHandler func:
  const loginHandler = async (event) => {
    // prevent refresh:
    event.preventDefault();

    // Prevent multiple clicks on form:
    if (loading) return;

    // error handling validation:(client side):

    // all fields:
    if (!email || !password) {
      return toast.error("Please fill in all the fields");
    }

    // email:
    if (!email.match(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)) {
      return toast.error("Email format is invalid");
    }

    // password
    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setLoading(true);

    try {
      // send request
      const res = await fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setLoading(false);

      // error handling validation (server side):
      if (
        res.status === 422 ||
        res.status === 409 ||
        res.status === 405 ||
        res.status === 401 ||
        res.status === 500
      ) {
        return toast.error(data.message, { duration: 5000 });
      }

      // success message:
      toast.success(data.message, { duration: 5000 });

      // email and password being empty:
      setEmail("");
      setPassword("");

      setIsAuthenticated(true);

      // here after login successful, we lead(redirect) to dashboard page.
      setTimeout(() => {
        router.replace("/dashboard");
      }, 900);
    } catch (err) {
      console.error(err);
      setLoading(false);
      toast.error("network error check your internet");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <form onSubmit={loginHandler}>
          {/* first input */}
          <input
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="text"
            placeholder="email"
          />
          <div className={styles.password}>
            {/* second input */}
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
            login {loading && <FaSpinner size="20px" className={styles.spin} />}
          </button>
          <div className={styles.notRegistered}>
            Not registered?
            <Link href="/auth/register">
              <span> Create an account</span>
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

// we want if user login after that we redirect to dashboard can't see login page again until logout(prevent go to login page).
// 1: SSR (server side) method (redirect to dashboards):
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

// 2: Client side method (redirect to dashboard):

// useEffect(() => {
//    const isAuth = async () => {
//       const res = await fetch("/api/auth/status")
//       if (res.status === 200) {
//          router.replace("/dashboard")
//       }
//    }
//    isAuth()
// }, [])
