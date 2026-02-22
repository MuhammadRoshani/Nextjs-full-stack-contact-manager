import Link from "next/link";
import styles from "@/components/navbar/navbar.module.css";
import { useRouter } from "next/router";
import { MdAddBox, MdSpaceDashboard } from "react-icons/md";
import { PiListNumbersBold } from "react-icons/pi";
import { CgLogIn, CgLogOut } from "react-icons/cg";
import toast from "react-hot-toast";

export default function Navbar({ isAuthenticated, setIsAuthenticated }) {
  // we use useRouter for our style active when we click on them (Add Contact or Contacts) color of icons or better say that svg color become green.
  const router = useRouter();
  const { route } = router;

  // logoutHandler func:
  const logoutHandler = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "GET",
        // this code means browser always, must send cookies with our request.
        credentials: "include",
      });
      const data = await res.json();

      if (res.status === 200) {
        toast.success(data.message);
        setIsAuthenticated(false);
        router.replace("/auth/login");
      } else {
        toast.error("Logout failed");
      }
    } catch {
      toast.error("Network error");
    }
  };

  return (
    <>
      <div className={styles.navbar}>
        <div className={styles.menu}>
          {/* first link: */}
          {isAuthenticated ? (
            // logout:
            // Logout is an action, not a navigation route, so we use button instead of Link, for fix our bug in logout section.
            <button
              onClick={logoutHandler}
              // if we go to this route below give active style else if we were not this route do nothing better say that give empty string class😂.
              // We don't apply "active" class because it's not a page route:

              // className={route === "/auth/login" ? styles.active : ""}
            >
              <CgLogOut /> Logout
            </button>
          ) : (
            // login:
            <Link
              href="/auth/login"
              className={route === "/auth/login" ? styles.active : ""}
            >
              <CgLogIn /> Login
            </Link>
          )}

          {/* second link: if user login show this link on navbar */}
          {isAuthenticated && (
            <Link
              href="/contacts/add"
              // if we go to this route below give active style else if we were not this route do nothing better say that give empty string class😂.
              className={route === "/contacts/add" ? styles.active : ""}
            >
              <MdAddBox /> Add Contact
            </Link>
          )}

          {/* third link: */}
          {isAuthenticated && (
            <Link
              href="/contacts"
              className={route === "/contacts" ? styles.active : ""}
            >
              <PiListNumbersBold /> Contacts
            </Link>
          )}

          {/* forth link: if user login show this link on navbar */}
          {isAuthenticated && (
            <Link
              href="/dashboard"
              className={route === "/dashboard" ? styles.active : ""}
            >
              <MdSpaceDashboard /> Dashboard
            </Link>
          )}
        </div>
      </div>
    </>
  );
}
