// conants to use
const STORAGE_KEY = "theme-chosen";
const root = document.documentElement;  //root element
const fieldset = document.getElementById("theme-picker"); //reference to fieldset id elemwnt

//read saved theme: return it or null to stop code crash
const safeGet = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    //Handle the case where localStorage throws
    // or is unavailable without breaking the page.
    return null;
  }
};

//write theme 
const safeSet = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    //no theme to write
  }
};

// make theme visible
const applyTheme = (value) => {  
  if (value === "light" || value === "dark") {
    root.setAttribute("data-theme", value); //use to change theme on html
  } else {
    root.removeAttribute("data-theme"); // for auto remove this attribute
  }
};

// keep visual state of buttons in sync
const syncButtons = (value) => {
  if (!fieldset) return; // if no fieldset stop to stop code crash
  fieldset.querySelectorAll("button").forEach((btn) => { // find all button in fieldset
    btn.setAttribute("aria-pressed", String(btn.value === value)); // for each button compare its 
                                                                   // own val to current theme val passed in
  });
};

const saved = safeGet() || "auto";
applyTheme(saved);

if (fieldset) {
  fieldset.hidden = false;  // only work when fielset exists 
  syncButtons(saved);  // when buttons visible and match --> look presed 

  fieldset.addEventListener("click", (event) => { //set up for clicks in the fieldset then figure out whcih chikd was clicked 
    const button = event.target.closest("button"); // the actual elemtn clicked
    if (!button) return; //no button really clciked return 
    applyTheme(button.value); //get real button vals
    syncButtons(button.value);
    safeSet(button.value);
  });
}