function loginUser() {

  const business =
  document.getElementById("businessName").value.trim();

  const owner =
  document.getElementById("ownerName").value.trim();

  const phone =
  document.getElementById("phone").value.trim();

  if(!business || !owner || !phone){

    alert("Please fill all fields");
    return;

  }

  localStorage.setItem(
    "greenmarkUser",
    business
  );

  localStorage.setItem(
    "ownerName",
    owner
  );

  localStorage.setItem(
    "phone",
    phone
  );

  localStorage.setItem(
    "isLoggedIn",
    "true"
  );

  window.location.href = "input.html";
}
localStorage.setItem("user", "Ashish");
console.log("PAGE LOADED");