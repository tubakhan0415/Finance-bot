$(document).ready(function() {
    let step = 1; // Start directly with asking for the degree
    let profession = '', experience = 0, cibilScore = false;

    function postMessage(message, sender) {
        console.log("Posting message:", message); // Debugging line
        const chatWindow = $('#chat');
        chatWindow.append(`<li class="${sender}">${message}</li>`);
        chatWindow.scrollTop(chatWindow.prop("scrollHeight"));
    }
    

    // Immediately ask for the degree
    postMessage("What's your degree? (BAMS/BHMS/BDS/MBBS/MD/MS)", 'bot-right');

    $('#userInput').keypress(function(e) {
        if (e.which === 13) { // Enter key pressed
            e.preventDefault();
            const userInput = $('#userInput').val().trim();
            if (!userInput) return;
            postMessage(userInput, 'user-left');
            handleUserInput(userInput.toLowerCase());
            $('#userInput').val('');
        }
    });

    function handleUserInput(input) {
        // Process input based on the current step
        switch(step) {
            case 1:
                processDegree(input);
                break;
            case 2:
                processExperience(input);
                break;
            case 3:
                processCibil(input);
                break;
        }
    }

    function processDegree(input) {
        profession = input.toUpperCase();
        if (["BAMS", "BHMS", "BDS", "MBBS", "MD/MS"].includes(profession)) {
            step++;
            postMessage("How many years of experience do you have?", 'bot-right');
        } else {
            postMessage("Please enter a valid degree from the options provided.", 'bot-right');
        }
    }

    function processExperience(input) {
        experience = parseInt(input);
        if (!isNaN(experience)) {
            step++;
            postMessage("Do you have a CIBIL score check? (Yes/No)", 'bot-right');
        } else {
            postMessage("Please enter a valid number for your experience.", 'bot-right');
        }
    }

    function processCibil(input) {
        cibilScore = input === "yes";
        step = 1; // Reset for a new conversation
        calculateProfessionalLoan();
    }

    function calculateProfessionalLoan() {
        let eligibilityAmount = 0;
    
        if (profession === "BAMS" || profession === "BHMS" || profession === "BDS") {
            eligibilityAmount = experience > 9 ? 1000000 : experience * 100000;
        } else if (profession === "MBBS") {
            if (experience <= 2) eligibilityAmount = 500000;
            else if (experience <= 10) eligibilityAmount = experience * 2 * 100000;
            else eligibilityAmount = 2800000;
            if (cibilScore) eligibilityAmount = Math.min(eligibilityAmount, 1500000);
        } else if (profession === "MD/MS") {
            eligibilityAmount = experience <= 5 ? 3500000 : 5000000;
            if (cibilScore) eligibilityAmount = 2000000;
        }
    
        postMessage(`Eligibility Amount for Professional Loan: ${eligibilityAmount.toLocaleString()}`, 'bot-right');
        // Indicate the conversation can restart with a new degree input
        // postMessage("To start a new calculation, please enter your degree (BAMS/BHMS/BDS/MBBS/MD/MS):", 'bot-right');
        // step = 1; // Reset for a new conversation
    }

          // Toggle chatbox visibility
    window.toggleChatbox = function() {
        var chatbox = $("#chatbox");
        var chatButton = $("#chatboxButton");
        
        if (chatbox.css("display") === "none") {
            chatbox.show();
            chatButton.hide();
        } else {
            chatbox.hide();
            chatButton.show();
        }
    };

    // Initially hide the chatbox and only show the button
    $('#chatbox').hide();
    $('#chatboxButton').show();
});

       

    