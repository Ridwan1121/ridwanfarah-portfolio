document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#contact-form");
    if (!form) return;

    // Create a div for success messages
    const successDiv = document.createElement("div");
    successDiv.classList.add("success-message");
    successDiv.style.display = "none";
    successDiv.style.color = "green";
    successDiv.style.marginTop = "10px";
    form.parentNode.insertBefore(successDiv, form.nextSibling);

    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const nameInput = form.querySelector("input[type='text']");
        const emailInput = form.querySelector("input[type='email']");
        const messageInput = form.querySelector("textarea");
        const submitBtn = form.querySelector("button[type='submit']");

        let isValid = true;

        // Helper functions
        const showError = (element, message) => {
            let errorSpan = element.nextElementSibling;
            if (!errorSpan || !errorSpan.classList.contains('error-message')) {
                errorSpan = document.createElement('span');
                errorSpan.classList.add('error-message');
                element.parentNode.insertBefore(errorSpan, element.nextSibling);
            }
            errorSpan.textContent = message;
            errorSpan.style.color = 'red';
            errorSpan.style.fontSize = '0.9em';
            errorSpan.style.display = 'block';
            errorSpan.style.marginTop = '5px';
            element.style.borderColor = 'red';
        };

        const clearError = (element) => {
            let errorSpan = element.nextElementSibling;
            if (errorSpan && errorSpan.classList.contains('error-message')) {
                errorSpan.style.display = 'none';
            }
            element.style.borderColor = '#ddd';
        };

        // Somali validation messages
        const validationMessages = {
            nameRequired: "Fadlan geli magacaaga",
            emailRequired: "Fadlan geli emailkaaga",
            emailInvalid: "Fadlan geli email sax ah",
            messageRequired: "Fadlan qor fariintaada",
            success: "Mahadsanid! Fariintaadu waa la diray. Waxa ku soo noqon doonaa dhowr maalmood gudahood."
        };

        // Name validation
        if (!nameInput.value.trim()) {
            showError(nameInput, validationMessages.nameRequired);
            isValid = false;
        } else {
            clearError(nameInput);
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailInput.value.trim()) {
            showError(emailInput, validationMessages.emailRequired);
            isValid = false;
        } else if (!emailPattern.test(emailInput.value.trim())) {
            showError(emailInput, validationMessages.emailInvalid);
            isValid = false;
        } else {
            clearError(emailInput);
        }

        // Message validation
        if (!messageInput.value.trim()) {
            showError(messageInput, validationMessages.messageRequired);
            isValid = false;
        } else if (messageInput.value.trim().length < 10) {
            showError(messageInput, "Fariintu waa in ay ka kooban tahay ugu yaraan 10 xaraf");
            isValid = false;
        } else {
            clearError(messageInput);
        }

        if (isValid) {
            // Disable button during submission
            submitBtn.disabled = true;
            submitBtn.textContent = "Lagu wadaayo...";
            submitBtn.style.opacity = "0.7";

            // Simulate AJAX submission (replace with actual fetch/axios call)
            setTimeout(() => {
                // Show success message
                successDiv.textContent = validationMessages.success;
                successDiv.style.display = "block";
                
                // Reset form and button
                form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = "Fariin Dir";
                submitBtn.style.opacity = "1";
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    successDiv.style.display = "none";
                }, 5000);
                
                // Scroll to show success message
                successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1500);
        }
    });

    // Add live validation as users type
    form.querySelectorAll("input, textarea").forEach(input => {
        input.addEventListener("input", function() {
            clearError(this);
        });
    });
});