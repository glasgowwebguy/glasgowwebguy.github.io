

document.addEventListener("DOMContentLoaded", function () {
  // Cloudflare Worker base URL (replace with your Worker URL)
  const WORKER_BASE_URL = 'https://my-worker.glasgowwebguy.workers.dev';

  // Fetch and display prices from Stripe
  async function loadPrices() {
    try {
      const response = await fetch(`${WORKER_BASE_URL}/get-prices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch prices: ${response.statusText}`);
      }
      const prices = await response.json();

      // Update price displays in the DOM
      const priceElements = document.querySelectorAll('.price');
      priceElements.forEach(element => {
        const lookupKey = element.dataset.lookupKey;
        const priceData = prices.find(price => price.lookup_key === lookupKey);
        if (priceData) {
          element.textContent = `Price: ${new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: priceData.currency,
          }).format(priceData.amount)}`;
        } else {
          element.textContent = 'Price: Not available';
        }
      });
    } catch (error) {
      console.error('Error loading prices:', error);
      document.querySelectorAll('.price').forEach(element => {
        element.textContent = 'Price: Error';
      });
    }
  }

  // Call loadPrices immediately
  loadPrices();

 
  // Stripe Checkout Integration with Quantity Support
  async function buy(lookupKey, color) {
    const quantityInput = document.getElementById(`quantity-${color}`);
    if (!quantityInput) {
      alert(`Quantity input for ${color} not found.`);
      return;
    }

    const quantity = parseInt(quantityInput.value);
    if (isNaN(quantity) || quantity < 1) {
      alert("Please enter a valid quantity.");
      return;
    }

    try {
      // Fetch prices to get the price_id for the lookup_key
      const priceRes = await fetch(`${WORKER_BASE_URL}/get-prices`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!priceRes.ok) {
        throw new Error(`Failed to fetch prices: ${priceRes.statusText}`);
      }
      const prices = await priceRes.json();
      const priceData = prices.find(price => price.lookup_key === lookupKey);
      if (!priceData) {
        alert('Price not found for this product.');
        return;
      }

      // Create checkout session
      const checkoutRes = await fetch(`${WORKER_BASE_URL}/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priceId: priceData.price_id, quantity }),
      });
      if (!checkoutRes.ok) {
        throw new Error(`Failed to create checkout: ${checkoutRes.statusText}`);
      }
      const data = await checkoutRes.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Checkout error: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Failed to start checkout: ' + err.message);
    }
  }

  // Attach click handlers to buttons
  const buyYellowBtn = document.getElementById('buy-yellow');
  const buyBlueBtn = document.getElementById('buy-blue');

  if (buyYellowBtn) {
    buyYellowBtn.addEventListener('click', () => {
      const lookupKey = buyYellowBtn.dataset.lookupKey;
      buy(lookupKey, 'yellow');
    });
  }

  if (buyBlueBtn) {
    buyBlueBtn.addEventListener('click', () => {
      const lookupKey = buyBlueBtn.dataset.lookupKey;
      buy(lookupKey, 'blue');
    });
  }
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');
    const submitButton = form?.querySelector('button[type="submit"]');
    
    if (!form || !formMessage || !submitButton) {
        console.warn('Contact form or required elements not found');
        return;
    }
    
    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        
        // Reset previous messages
        formMessage.classList.remove('alert', 'alert-success', 'alert-danger', 'd-none');
        formMessage.textContent = '';
        formMessage.setAttribute('aria-live', 'polite'); // Accessibility: Announce changes to screen readers
        
        // Client-side validation
        if (!form.checkValidity()) {
            form.classList.add('was-validated');
            return;
        }
        
        // Basic email format validation
        const email = form.querySelector('#email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            form.classList.add('was-validated');
            form.querySelector('#email').setCustomValidity('Invalid email format');
            return;
        } else {
            form.querySelector('#email').setCustomValidity('');
        }
        
        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';
        
        // Prepare form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message'),
            botField: formData.get('bot-field')
        };
        
        try {
            // Add timeout to fetch request
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

          // Update Endpoint fetch adress: https://my-worker.glasgowwebguy.workers.dev/
            const response = await fetch('https://my-worker.glasgowwebguy.workers.dev', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const result = await response.json();
            
            if (response.ok) {
                formMessage.classList.add('alert', 'alert-success');
                formMessage.textContent = 'Your message has been sent successfully!';
                form.reset();
                form.classList.remove('was-validated');
            } else {
                formMessage.classList.add('alert', 'alert-danger');
                formMessage.textContent = result.message || 'Failed to send message. Please try again.';
            }
        } catch (error) {
            formMessage.classList.add('alert', 'alert-danger');
            formMessage.textContent = error.name === 'AbortError' 
            ? 'Request timed out. Please try again.'
            : 'An error occurred. Please try again later.';
            console.error('Form submission error:', error);
        } finally {
            // Re-enable button
            submitButton.disabled = false;
            submitButton.textContent = 'Send Message';
        }
        
        formMessage.classList.remove('d-none');
        formMessage.focus(); // Accessibility: Focus on message for screen readers
        
        // Clear message after 5 seconds
        setTimeout(() => {
            formMessage.classList.add('d-none');
            formMessage.textContent = '';
            formMessage.classList.remove('alert', 'alert-success', 'alert-danger');
        }, 5000);
    });
});





