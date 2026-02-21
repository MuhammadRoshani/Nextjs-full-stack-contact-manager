// we use DRY(don't repeat yourself) rules for our protection routes(dashboard, add, contacts)

import { verify } from "jsonwebtoken";

export default async function validateToken(context) {
  // not exist jwt secret:
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not defined");
  }
  // we access(get) to our token by this code below we bring out, our token from cookies.
  const { token } = context.req.cookies;
  if (!token) {
    // in fact here user not login.
    // if we have not token, must redirect to this route /auth/login (login page).
    return false;
  }

  // verify token(validation: jwt):
  // in fact payload is our data, including : email, role, userId, production data token and expire date token. at all, all we have 3 values on every token: 1.header 2.payload 3.verify signature
  try {
    const payload = verify(token, process.env.JWT_SECRET);
    return payload; // email and role amd userId
  } catch (error) {
    //   if our token are corrupt or better say expire or at all we we have problems with our token:
    return false;
  }
}

// 💯💯💯
// three routes are private or better say that protection routes
// 1:/dashboard
// 2:/contacts/add
// 2:/contacts
// only when have valid token after success login on our cookies, can access to this routes, and when have token, that time our login be successful our token created on cookie and access to this token from application section on our browser.

// in fact token is our key to can access to private or protection routes.
