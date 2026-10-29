// Synthetic identity/location details for isolated authentication fixtures.
export function signupDetails(name = "Synthetic Test Runner") {
  const [firstName, ...familyName] = name.split(" ");
  return {
    name,
    firstName,
    lastName: familyName.join(" "),
    signupCountry: "England",
    signupLocation: "Norwich",
  };
}
