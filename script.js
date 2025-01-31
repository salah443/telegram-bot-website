document.getElementById("watchAd").addEventListener("click", function() {
    fetch("update_balance.php", { method: "POST" })
        .then(response => response.json())
        .then(data => {
            document.getElementById("balance").innerText = data.balance;
            alert("You earned points!");
        });
});

// Fetch current balance when page loads
window.onload = function() {
    fetch("get_balance.php")
        .then(response => response.json())
        .then(data => {
            document.getElementById("balance").innerText = data.balance;
        });
};
