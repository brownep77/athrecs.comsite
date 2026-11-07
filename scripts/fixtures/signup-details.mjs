// Synthetic identity/location details for isolated authentication fixtures.
export function signupDetails(name = "Synthetic Test Runner") {
  const [firstName, ...familyName] = name.split(" ");
  return {
    name,
    firstName,
    lastName: familyName.join(" "),
    signupCountry: "England",
    signupNationality: "United Kingdom",
    signupPostcode: "NR1 1AA",
    signupLocation: "Norwich",
    signupDateOfBirth: "1990-05-15",
    signupClubs: "Synthetic Runners AC",
  };
}
