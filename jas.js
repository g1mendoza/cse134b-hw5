/*file for extra credit: makes hamburger menu buttom work 
Without this file, the menu button would exist in the HTML
but clicking it would do nothing. 

document.querySelector(...) searches the whole page for the 
FIRST element that matches the given CSS selector
*/

// Finds your hamburger button the one with class="menu-toggle" 
const menuButton = document.querySelector(".menu-toggle");

// Finds the <nav> that's inside your <header> that we want 
// to show/hdie when button is clocked 
const navigation = document.querySelector("header nav");

// addEventListener registers a "listener" that waits for a specific event
menuButton.addEventListener("click", () => {

    // classList.toggle("open") adds the "open" class if it's not there,
    // or removes it if is flipping it on/off with each click
    navigation.classList.toggle("open");
});