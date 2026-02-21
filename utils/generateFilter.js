// this function below for searching in url(query string) in contacts page both side:
export default function generateFilter({ gender, search }, userId) {
  const filter = { userId };
  if (gender === "male" || gender === "female") {
    filter.gender = gender;
  }
  if (search) {
    filter.$or = [
      // here below we use pattern for searching the fname and lname, first value : check single letter if find show it for example if we have muhammad name in our database in search bar we write mu that regex pattern find it, and second value for case sensitive no matter write small or big letter.
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }
  return filter;
}
