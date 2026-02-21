import connectDB from "@/utils/connectDB";
import User from "@/models/User";
import styles from "@/styles/Dashboard.module.css";
import validateToken from "@/utils/auth";

export default function Dashboard({ user }) {
  return (
    <>
      <div className={styles.container}>
        <h1>
          Hi {user.firstName} {user.lastName}
        </h1>
        <h2>Welcome to dashboard❤️</h2>
      </div>
    </>
  );
}

// check token in request header on cookies exist, by SSR method:
export async function getServerSideProps(context) {
  // we define validToken in utils directory.
  const payload = await validateToken(context);
  if (!payload) {
    return {
      redirect: { destination: "/auth/login", permanent: false },
      // it means this redirect is temporary and the browser should not cache.
    };
  }

  try {
    // connect to database:
    await connectDB();

    // welcome message after login:

    // get all data:(we just need fname and lname by using select method access to them)
    // here we find by email in our database, find the user that email equal to Payload
    const user = await User.findOne({ email: payload.email }).select(
      "firstName lastName -_id",
    );

    if (!user) {
      return {
        redirect: {
          destination: "/auth/login",
          permanent: false,
        },
      };
    }

    return {
      props: {
        user: JSON.parse(JSON.stringify(user)),
      },
    };
  } catch (error) {
    // also our token expire or invalid redirect to login page and at all can't access to dashboard page.
    return {
      redirect: {
        destination: "/auth/login",
        permanent: false,
      },
    };
  }
}

// 💯💯💯
// two routes are private or better say that protection routes
// 1:/dashboard
// 2:/contacts/add
// only when have valid token after success login on our cookies, can access to this routes, and when have token, that time our login be successful our token created on cookie and access to this token from application section on our browser.

// in fact token is our key to can access to private or protection routes.
