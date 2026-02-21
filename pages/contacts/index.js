import { useEffect, useState } from "react";
import Contact from "@/models/Contact";
import connectDB from "@/utils/connectDB";
import ContactItem from "@/components/contact/contactItem";
import styles from "@/styles/Contacts.module.css";
import toast from "react-hot-toast";
import { useRouter } from "next/router";
import validateToken from "@/utils/auth";
import generateFilter from "@/utils/generateFilter";
import { MdOutlineFavoriteBorder } from "react-icons/md";

export default function Contacts({ contactsList }) {
  // this five states for our search bar section on top the contact page and if we write invalid name or family say some message, for change gender or search name or family in fact we sorting them by different category and favorite contacts we liked.
  const [contacts, setContacts] = useState(contactsList);
  const [searchKey, setSearchKey] = useState("");
  const [searchGender, setSearchGender] = useState("");
  const [notFound, setNotFound] = useState(false);
  // this state below for heart icon in top the page aside to searchbar.
  const [favStatus, setFavStatus] = useState(false);

  // this router state below for search in url every thing right value write in url inside of our input come this value for example we search muhammad firstName, muhammad value come in our input.
  const router = useRouter();
  const { gender, search } = router.query;

  useEffect(() => {
    if (gender) setSearchGender(gender);
    if (search) setSearchKey(search);
  }, [gender, search]);

  // searchHandler func:
  // (why our function async because we want connect to db)
  const searchHandler = async () => {
    try {
      // we define two key for search in url (gender and search(name and family)) in api/contacts directory.
      // we send request to our api for get our contacts info by category:
      const res = await fetch(
        `/api/contacts?gender=${searchGender}&search=${searchKey}`,
      );
      const data = await res.json();
      setContacts(data);

      // this code below for when in search bar we put some invalid name or family give us some message.
      if (!data || data.length === 0) {
        setNotFound(true);
      } else {
        setNotFound(false);
      }
    } catch (error) {
      toast.error("server error");
    }
  };

  // showFavoriteHandler func:
  // in first click initial value of favStatus is false and because of that execute else and after that we click become true and main if executed this explanation for Don't be confused.
  const showFavoriteHandler = () => {
    // value of favStatus:
    if (favStatus) {
      setContacts(contactsList);
    } else {
      // here we search on our all contacts, the heart icon or better say value of favorite equal to true we show in favorite section at top the page.
      // we checked favorite section from db id true return and put in favorite section.
      const favoriteContact = contacts.filter(
        (contact) => contact.favorite === true,
      );
      // here because value of state change, our page render again and we see just favorite contacts.
      setContacts(favoriteContact);
    }

    setFavStatus(!favStatus);
  };

  return (
    <>
      {/* search bar on top the contact page: */}
      <div className={styles.searchContainer}>
        {/* specify name or family by search: */}
        <input
          type="text"
          onChange={(e) => setSearchKey(e.target.value)}
          placeholder="Enter name or family"
          value={searchKey}
        />
        {/* specify gender: */}
        <select
          value={searchGender}
          onChange={(e) => setSearchGender(e.target.value)}
        >
          {/* here below selected get values from url in fact true or false in this code */}
          <option value="">all</option>
          <option value="male">male</option>
          <option value="female">female</option>
        </select>
        <button onClick={searchHandler}>search</button>
        {/* favorite contacts: heart icon */}
        <MdOutlineFavoriteBorder
          size="35px"
          fill={favStatus ? "#ff54b2" : "black"}
          onClick={showFavoriteHandler}
        />
      </div>

      {/* if there are no contacts in db or fetch failed, prevent crash and show empty state. */}
      {contacts.length === 0 && !notFound && (
        <p style={{ textAlign: "center", marginTop: 40 }}>No contacts found</p>
      )}

      {/* notFound state message: */}
      {notFound && <p className={styles.noAudience}>No audience found</p>}
      {/* we rendered our data by using map method in array. */}
      {/* if we want immediately our contact remove from page (UI) when you clicked on trash icon : we must send or better say that to pass contacts state value and also setter and we receive it this values in ContactItem component to use, in fact we use lifting state up method to passed our state to another component*/}

      {contacts.map((contact) => (
        <ContactItem
          key={contact._id}
          {...contact}
          contacts={contacts}
          setContacts={setContacts}
        />
      ))}
    </>
  );
}

// if we have valid token we can access to this route same as dashboard and add page.
// SSR method:
// we get off searching from server in url for example we write in url search=muhammad in UI show just everyone his firstName equal to muhammad and disappear another contacts:
export async function getServerSideProps(context) {
  // validate token:
  const payload = await validateToken(context);
  if (!payload) {
    return {
      redirect: { destination: "/auth/login", permanent: false },
      // it means this redirect is temporary and the browser should not cache.
    };
  }
  const userId = payload.userId;

  // context.query deliver a object
  const filter = generateFilter(context.query, userId);

  // first method:
  //// one note : in serverSideProps we must write complete URL, we can't write relative path like this : /api/contacts
  //// const res = await fetch("http://localhost:3000/api/contacts", {
  ////   method: "GET",
  //// });
  //// const data = await res.json();

  // fetching data or better say receiving data from server:

  // instead of we receive our data from api , we receive from database directly , because ssr method execute in server.
  // here below we connected to our database directly by Contact model and get all our data :

  // second method:
  await connectDB();

  // we get or receive our contacts with code below.
  // we show here only contacts that add by that user make it or better say add it, in fact category them by every user login, how it possible, we must equal userId we get from our token with that id from contacts in collection.
  // find the contacts that owner user login successfully.
  const contacts = await Contact.find(filter);
  // query string: url (we use this for, ability of sort and searching the name, family and gender in our forms)

  // ✅✅✅✅✅✅✅✅✅✅✅✅
  // const contacts = await Contact.find().lean(); // lean method : convert to plain(simple) js object , this line up return object document from mongoDB and we convert to js object.
  return {
    // we receive contactsList at the top in function👆
    props: { contactsList: JSON.parse(JSON.stringify(contacts)) },
    // serializing error : we must convert our data to json because of error serializing in serverSideProps , better say that if our value can't convert to json for ex like undefined or function values we receive serializing error , for fix our error we must use JSON.stringify() and this method remove all values like undefined and function and will return another true value , if we have real example in mongoDB _id(objectId) field we can't convert to json and we change type of that by JSON.stringify() and we receive simple string json and after that use JSON.parse() to convert our json to object in fact first convert to json to bring out true values after that true values convert to object for use.
  };
}

// 📍📍📍📍📍📍📍📍
// we use SSR(server side rendering) method for receiving data, api from database(best and logical choice).
// 1:why we use SSR ? because if we want for example add new contact from add page, the same moment our information or data loaded and receive from server, 2:if we use SSG(static site generation) method, page not rendered is good for static page like about us for example, 3: or if we use ISR(incremental static regeneration) method, again we want the same moment our data loaded for ex : set our time in 60 second after 60s our page updated and not good for this project.
