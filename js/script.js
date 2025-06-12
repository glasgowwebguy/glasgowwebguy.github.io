// Chat Bubble 
/*
async function fetchPhoneNumber() {
    try {
        const response = await fetch('https://chat-bubble-worker.glasgowwebguy.workers.dev/phone');
        const data = await response.json();
        return data.phoneNumber;
    } catch (error) {
        console.error('Error fetching phone number:', error);
        return null;
    }
}

async function initChatLinks() {
    const phoneNumber = await fetchPhoneNumber();
    if (phoneNumber) {
        document.getElementById('whatsappLink').href = `https://wa.me/${phoneNumber}?text=Hello!%20I%20have%20a%20question`;
        document.getElementById('callLink').href = `tel:${phoneNumber}`;
    } else {
        document.getElementById('chatMenu').style.display = 'none'; // Hide menu if fetch fails
    }
}

function toggleChatMenu() {
    const menu = document.getElementById('chatMenu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
}

// Close menu when clicking outside
document.addEventListener('click', function(event) {
    const container = document.querySelector('.chat-bubble-container');
    if (!container.contains(event.target)) {
        document.getElementById('chatMenu').style.display = 'none';
    }
});

// Initialize chat links on page load
document.addEventListener('DOMContentLoaded', initChatLinks);

*/
