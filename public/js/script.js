(() => {
    'use strict'
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()


// FOR FLASHES
    // Automatically hide the alert after 5 seconds (5000ms)
setTimeout(() => {
      const flashMessage = document.getElementById('flashMessage');
      if (flashMessage) {
        // Remove 'show' class to trigger fade out
        flashMessage.classList.remove('show');
        // Wait for the fade-out animation to finish before removing the element
        flashMessage.addEventListener('transitionend', () => flashMessage.remove());
      }
}, 2000);


//  FOR INPUT BUTTONS 
document.addEventListener('DOMContentLoaded', function() {
    // Attach event listeners to all decrement and increment buttons
    const decrementButtons = document.querySelectorAll('.decrement');
    const incrementButtons = document.querySelectorAll('.increment');
        
        // Decrement logic
    decrementButtons.forEach(button => {
        button.addEventListener('click', function() {
          const productId = this.dataset.productId;
          const quantityInput = document.querySelector(`#quantity-${productId}`);
          let currentValue = parseInt(quantityInput.value);
          if (currentValue > 1) {
            quantityInput.value = currentValue - 1;
          }
        });
    });
  
        // Increment logic
    incrementButtons.forEach(button => {
        button.addEventListener('click', function() {
          const productId = this.dataset.productId;
          const quantityInput = document.querySelector(`#quantity-${productId}`);
          quantityInput.value = parseInt(quantityInput.value) + 1;
        });
    });
});
