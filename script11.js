$(document).ready(function() {
    class Chatbox {
        constructor() {
            this.args = {
                openButton: document.querySelector('.chatbox__button'),
                chatBox: document.querySelector('.chatbox__support'),
                sendButton: document.querySelector('.send__button'),
                modeButton: document.querySelector('.mode__button'),
            };

            this.state = false;
            this.messages = [];
            this.mode = 'chat'; // Initialize mode as 'chat'
            this.step = 1;
            this.profession = '';
            this.experience = 0;
            this.cibilScore = false;
            this.totalSalary = 0;
            this.totalObligation = 0;
            this.selectedBank = '';
            this.loanType = null; // Added for 'personal', 'professional', or 'business' differentiation
            this.businessLoanParameter = null; // Added for business loan parameter selection
            this.balanceDates = []; // Added for storing bank balances
            this.currentPrompt = null;
            this.history = []; // Initialize the history array


            this.initEvents();
            this.init();
        }
        
        initEvents() {
            const { openButton, chatBox, sendButton, modeButton } = this.args;
        
            // Listener for opening the chatbox
            openButton.addEventListener('click', () => this.toggleState(chatBox));
            // Listener for sending a message
            sendButton.addEventListener('click', () => this.onSendButton());
            // Listener for toggling between modes (chat, calculator, etc.)
            modeButton.addEventListener('click', () => this.toggleMode());
        
            // Listen for "Enter" key press in the input field
            const node = chatBox.querySelector('input');
            node.addEventListener("keyup", ({ key }) => {
                if (key === "Enter") {
                    this.onSendButton();
                }
            });
        
        }
        
        
        init() {
            this.args.chatBox.classList.remove('chatbox--active');
            }
        
         // Add a new method to switch to chat mode
        // switchToChatMode() {
            //this.mode = 'chat'; // Set mode to chat
            //this.messages.push({ name: "System", alignment: "left", message: "Chat mode. How can I assist you?" });
            //this.updateChatText(this.args.chatBox);
            // Optionally, reset calculator mode specifics here
            //this.resetCalculatorMode();
       //}

        toggleState(chatbox) {
            this.state = !this.state;
            chatbox.classList.toggle('chatbox--active', this.state);
        }

        toggleMode() {
            this.history.push({mode: this.mode, step: this.step, loanType: this.loanType});
            switch (this.mode) {
                case 'chat':
                    this.mode = 'calculator';
                    this.messages.push({ name: "System",alignment: "right", message: "Calculator mode. Choose 'personal', 'professional', 'business', 'emi', or 'average balance'." });
                    break;
                case 'calculator':
                    this.mode = 'emi';
                    this.promptForEmiDetails();
                    break;
                case 'average balance':
                    this.mode = 'averageBalance';
                    this.promptForAverageBalance();
                    break;
                default:
                    this.mode = 'chat';
                    this.messages.push({ name: "System", alignment: "left",message: "Chat mode. How can I assist you?" });
                    this.resetCalculatorMode(); // Ensure to reset any calculator mode specific states
            }
            this.updateChatText(this.args.chatBox);
        }
        onSendButton() {
            const textField = this.args.chatBox.querySelector('input');
            const text = textField.value.trim();
            if (!text) return;
            
            this.history.push({mode: this.mode, step: this.step, loanType: this.loanType});
            this.messages.push({ name: "User",alignment: "right", message: text });

            if (this.mode === 'chat') {
                this.fetchChatResponse(text);
            } else if (this.mode === 'emi') {
                // Directly call handleEmiMode if the current mode is 'emi'
                this.handleEmiMode(text);
            } else if (this.mode === 'average balance') {
                // Handle average balance calculation
                this.handleAverageBalanceMode(text);
            } else {
                this.handleCalculatorMode(text);
            }
            textField.value = '';
            this.updateChatText(this.args.chatBox);
        }

        fetchChatResponse(text) {
            // Always send user input to Flask API when in chat mode
            fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                body: JSON.stringify({ message: text }),
                headers: { 'Content-Type': 'application/json' },
            })
            .then(response => response.json())
            .then(data => {
                this.messages.push({ name: "Bot", alignment: "left",message: data.answer });
                this.updateChatText(this.args.chatBox);
            })
            .catch(error => {
                console.error('Error:', error);
                this.messages.push({ name: "Bot", alignment: "left",message: "Sorry, there was a problem. Please try again later." });
                this.updateChatText(this.args.chatBox);
            });
          
        }

        handleInputBasedOnMode(text) {
            if (this.mode === 'chat') {
                this.fetchChatResponse(text);
            } else {
                // Delegate to specific handler based on loanType
                switch(this.loanType) {
                    case 'personal':
                        this.handlePersonalLoanMode(text);
                        break;
                    case 'professional':
                        this.handleProfessionalLoanMode(text);
                        break;
                    case 'business':
                        this.handleBusinessLoanMode(text);
                        break;
                    case 'emi':
                        this.handleEmiMode(text);
                        break;
                    default:
                        this.messages.push({ name: "Bot", alignment: "left",message: "Please select an option from the menu." });
                        break;
                }
            }
        }

        handleCalculatorMode(text) {
            const lowerCaseText = text.toLowerCase();
            // Checking if the input matches any of the loan types or modes.
            if (['personal', 'professional', 'business', 'emi', 'average balance'].includes(lowerCaseText)) {
                this.loanType = lowerCaseText;
                this.mode = 'calculator';
                switch (lowerCaseText) {
                    case 'personal':
                        this.promptForPersonalLoan();
                        break;
                    case 'professional':
                        this.promptForProfessionalLoan();
                        break;
                    case 'business':
                        this.promptForBusinessLoan();
                        break;
                    case 'emi':
                        // Ensure we directly move to prompting for EMI details.
                        this.promptForEmiDetails();
                        break;
                    case 'average balance':
                        this.promptForAverageBalance();
                        break;
                }
            } else {
                // If the mode is already set to a specific calculator mode, delegate to the appropriate handler.
                this.delegateToLoanHandler(text);
            }
        }
        

        promptForLoanDetails = function(loanType) {
            // Assuming this method is correctly called after bank selection
            if (loanType === 'financialProgram') {
                // The code here should correctly handle what's expected next
                // For example, if prompting for business parameters is next:
                this.promptForBusinessParameters();
            }
            // Handle other loan types as needed
        };
        
        promptForBankSelection() {
            this.messages.push({
                name: "Bot",
                alignment: "left",
                message: "Please select your bank: " + this.generateBankButtonsHTML()
            });
            this.updateChatText();
        }
      promptForPersonalLoan() {
            this.loanType = 'personal';
            this.mode = 'calculator'; // Move to calculator mode
            this.messages.push({ name: "Bot", alignment: "left",message: "Please enter your total salary." });
            this.step = 1; // Prepare for the first step of personal loan details
            this.updateChatText();
            this.history.push('personalLoan'); // Update history
        }
  // Modified promptForProfessionalLoan method to show profession buttons
        promptForProfessionalLoan() {
            this.loanType = 'professional';
            this.mode = 'calculator'; // Move to calculator mode
            // Push a message with buttons for selecting a profession
            this.messages.push({ name: "Bot", alignment: "left", message: "Please select your profession: " + this.generateProfessionButtonsHTML() });
            this.step = 1; // Prepare for the first step of professional loan details
            this.updateChatText();
          
        }

        promptForBusinessLoan() {
            console.log("Is promptForBankSelection a function?", typeof this.promptForBankSelection === "function"); // Should log true if everything is correct
            this.promptForBankSelection(); // Original call
        }
        
        promptForBusinessParameters() {
            // Ensure this method correctly generates the HTML for the parameter selection buttons.
            this.messages.push({
                name: "Bot",
                alignment: "left",
                message: "Please select a business parameter: " + this.generateBusinessParameterButtonsHTML()
            });
            this.updateChatText();
        }
        

        promptForEmiDetails() {
            this.loanType = 'emi';
            this.mode = 'calculator'; // Move to calculator mode
            this.messages.push({ name: "Bot", alignment: "left",message: "Please enter the loan amount." });
            this.step = 1; // Prepare for EMI calculation
            this.updateChatText();
            this.history.push('emiDetails');
        }

        // Additional method for handling average balance mode
        promptForAverageBalance() {
            this.loanType = 'average balance';
            this.mode = 'calculator'; // Assuming you're using a similar mode system
            this.step = 1;
            this.updateChatText(this.args.chatBox); // If you're using a step system for different stages
            this.history.push('averageBalance'); // Update history
            if (this.balanceDates.length < 6) {
                const dates = ["5th", "10th", "15th", "20th", "25th", "30th"];
                this.messages.push({ name: "Bot", alignment: "left",message: `Please enter your balance on the ${dates[this.balanceDates.length]}.` });
            } else {
                this.calculateAverageBalance();
            }
        }

        generateBusinessParameterButtonsHTML() {
            // First, clear existing buttons to prevent duplication.
            const container = document.querySelector('.business-parameter-buttons-container');
            if (container) {
                container.innerHTML = ''; // Clears existing buttons
            }
    
            // Define your business parameters here
            const parameters = ["turnover", "netprofit", "grossprofit"];
            return parameters.map(parameter => `<button class="business-parameter-button" data-parameter="${parameter}" onclick="window.chatBoxInstance.selectBusinessParameter('${parameter}')">${parameter}</button>`).join("");
        }
    
        selectBusinessParameter(selectedParameter) {
            // Prevent selecting the same parameter again to avoid potential duplication issues
            if (this.businessLoanParameter === selectedParameter) {
                console.log(`Parameter ${selectedParameter} is already selected.`);
                return; // Exit the function if the same parameter is selected again
            }
    
            this.businessLoanParameter = selectedParameter;
            // Assuming this is the correct part for setting the parameter and preparing for next input
            this.messages.push({ name: "Bot", alignment: "left", message: `You've selected ${selectedParameter}. Please enter the amount:` });
            this.step = 2; // Move to the next step, expecting the turnover/netprofit/grossprofit amount
            this.updateChatText(this.args.chatBox);
        }

        selectLoan(hasLoan) {
            this.cibilScore = hasLoan === "yes";
            // Now, instead of directly calculating, we should either move to the next question or calculate eligibility based on further input.
            if (this.loanType === 'professional') {
                this.calculateProfessionalLoan();
            }
            this.updateChatText(this.args.chatBox);
        }
        
    
delegateToLoanHandler(text) {
            switch (this.loanType) {
                case 'personal':
                    this.handlePersonalLoanMode(text);
                    break;
                case 'professional':
                    this.handleProfessionalLoanMode(text);
                    break;
                case 'business':
                    this.handleBusinessLoanMode(text);
                    break;
                case 'emi':
                        this.handleEmiMode(text);
                        break;
                default:
                    this.messages.push({ name: "Bot", alignment: "left",message: "Please first select a loan type: 'personal', 'professional', or 'business'." });
            }
        }
        handleProfessionalLoanMode(text) {
            switch (this.step) {
                case 1: // Asking for profession
                    if (["BAMS", "BHMS", "BDS", "MBBS", "MD", "MS"].includes(text.toUpperCase())) {
                        this.profession = text.toUpperCase();
                        this.messages.push({ name: "System", alignment: "left", message: "How many years of experience do you have?" });
                        this.step++;
                    } else {
                        this.messages.push({ name: "System", alignment: "left", message: "Please enter a valid profession (BAMS/BHMS/BDS/MBBS/MD/MS):" });
                    }
                    break;
                case 2: // Asking for years of experience
                    const experience = parseInt(text, 10);
                    if (!isNaN(experience) && experience >= 0) {
                        this.experience = experience;
                        // Show Yes/No buttons for running any loan instead of a text message
                        this.showLoanStatusQuestion();
                        this.step++;
                    } else {
                        this.messages.push({ name: "System", alignment: "left", message: "Please enter a valid number for your experience." });
                    }
                    break;
                case 3:
                    // This case is handled by the selectLoan method after the user clicks Yes or No
                    break;
                default:
                    // Handle any other steps or errors
                    this.messages.push({ name: "System", alignment: "left", message: "There seems to be an error. Please try again." });
                    this.step = 1; // Optionally reset to the first step for retry
                    break;
            }
            this.updateChatText(this.args.chatBox);
        }

        handlePersonalLoanMode(text) {
            switch (this.step) {
                case 1: // Asking for total salary
                    const totalSalary = parseFloat(text);
                    if (!isNaN(totalSalary) && totalSalary > 0) {
                        this.totalSalary = totalSalary;
                        this.messages.push({ name: "System", alignment: "right",message: "Please enter your monthly obligations:" });
                        this.step++;
                    } else {
                        this.messages.push({ name: "System", alignment: "left",message: "Please enter a valid total salary." });
                    }
                    break;
                case 2: // User has entered total obligations
                    const totalObligation = parseFloat(text);
                    if (!isNaN(totalObligation) && totalObligation >= 0) {
                        this.totalObligation = totalObligation;
    
                        // Show bank selection directly within the chat flow
                        this.messages.push({ name: "System", alignment: "left", message: "Select your bank for the loan:" + this.generateBankButtonsHTML() });
                        this.step++; // Advance the step or potentially reset it depending on your flow
                        
                        // Update chat text to include the bank selection buttons
                        this.updateChatText(this.args.chatBox);
                    } else {
                        this.messages.push({ name: "System", alignment: "left", message: "Please enter a valid total obligation." });
                        this.updateChatText(this.args.chatBox);
                    }
                    break;
                case 3: // Asking for selected bank
                    if (Object.keys(bankFoirMapping).includes(text.toUpperCase())) {
                        this.selectedBank = text.toUpperCase();
                        this.calculatePersonalLoan();
                        this.step = 1; // Reset for next calculation
                        this.mode = 'chat'; // Switch back to chat mode after calculation
                        this.personalLoanMode = false; // Reset loan mode
                        //this.messages.push({ name: "System-left", alignment: "left",message: "Switching back to chat mode." });
                    } else {
                        this.messages.push({ name: "System-left",alignment: "left", message: "Please choose a valid bank from the provided options." });
                    }
                    break;
                default:
                    this.messages.push({ name: "System-left",alignment: "left", message: "There seems to be an error. Please try again." });
                    this.step = 1; // Reset to the first step
            }
            this.updateChatText(this.args.chatBox);
        }
        
        handleBusinessLoanMode(text) {
            // Handle input based on the current step
            if (this.step === 2) {
                // Expecting to receive either just the amount or both amount and obligations separated by a comma
                let inputs = text.split(',').map(val => parseFloat(val.trim()));
                let [amount, obligations] = inputs.length === 2 ? inputs : [inputs[0], undefined];
        
                // Store the amount as an instance variable for future use
                this.amount = amount; // Ensure amount is stored correctly
        
                if (!isNaN(this.amount)) {
                    if (obligations === undefined) {
                        // If obligations were not provided, prompt the user for it
                        this.messages.push({ name: "Bot", alignment: "left", message: "Please enter the yearly obligations." });
                        this.step++; // Increment step to indicate we're now expecting obligations
                    } else {
                        // If both amount and obligations were provided, proceed to calculation
                        this.calculateBusinessLoan(this.amount, obligations);
                        // Reset for next input
                        this.resetBusinessLoanProcess();
                    }
                } else {
                    // If the amount is not a valid number, prompt again
                    this.messages.push({ name: "Bot", alignment: "left", message: "Invalid amount. Please enter a valid amount." });
                }
            } else if (this.step === 3) {
                // Step 3: Expecting obligations after the amount has already been provided
                const obligations = parseFloat(text);
                if (!isNaN(obligations)) {
                    // Use the stored amount and provided obligations to calculate the business loan
                    this.calculateBusinessLoan(this.amount, obligations);
                    // Reset for next input
                    this.resetBusinessLoanProcess();
                } else {
                    // If obligations input is not valid, prompt again
                    this.messages.push({ name: "Bot", alignment: "left", message: "Invalid obligations input. Please enter a valid number." });
                }
            }
            this.updateChatText(); // Update the chat with the new message
        }
        

        handleEmiMode(text) {
            // Implement EMI mode steps based on this.step
            switch (this.step) {
                case 1: // Loan amount
                    this.loanAmount = parseFloat(text);
                    this.messages.push({ name: "System", alignment: "left",message: "Please enter the annual interest rate (%)." });
                    this.step++;
                    break;
                case 2: // Interest rate
                    this.interestRate = parseFloat(text) / 1200; // Convert annual rate to monthly and percentage to decimal
                    this.messages.push({ name: "System", alignment: "left",message: "Please enter the loan tenure (in years)." });
                    this.step++;
                    break;
                case 3: // Loan tenure
                    this.loanTenure = parseInt(text) * 12; // Convert years to months
                    this.calculateEmi();
                    this.step = 1; // Reset for next calculation
                    this.mode = 'chat'; // Optionally switch back to chat mode after calculation
                    //this.messages.push({ name: "System",alignment: "left", message: "Switching back to chat mode." });
                    break;
            }
            this.updateChatText(this.args.chatBox);
        }
      
        handleAverageBalanceMode(text) {
            const balance = parseFloat(text);
            if (!isNaN(balance) && balance >= 0) {
                this.balanceDates.push(balance);
                this.promptForAverageBalance(); // Continue prompting for next balance
            } else {
                this.messages.push({ name: "Bot", alignment: "left",message: "Please enter a valid balance amount." });
                this.promptForAverageBalance(); // Reprompt for the same balance
            }
            this.updateChatText(this.args.chatBox);
        }
     
      //  handleProfessionSelection(text) {
            //const validProfessions = ["BAMS", "BHMS", "BDS", "MBBS", "MD", "MS"];
            //if (validProfessions.includes(text.toUpperCase())) {
              //  this.profession = text.toUpperCase();
            //this.advanceToNextStepWithMessage("How many years of experience do you have?");
            //} else {
              //  this.sendMessageToUser("Please enter a valid profession: " + validProfessions.join("/"));
            //}
        //}
        
      // Helper method to add a message to be displayed to the user
        sendMessageToUser(message) {
            this.messages.push({ name: "System", alignment: "left", message: message });
            this.updateChatText(this.args.chatBox);
        }
        
    
        promptForLoanType() {
            // Reset any specific loan type information
            this.loanType = null;
            this.messages.push({ name: "Bot", alignment: "left", message: "Please select a loan type again." });
        }

    generateBankButtonsHTML() {
        const banks = ["HDFC", "ICICI", "BAJAJ"];
        // Make sure to call a method that exists on your Chatbox instance, adjust if necessary
        return banks.map(bank => `<button class="bank-button" onclick="window.chatBoxInstance.selectBank('${bank}')">${bank}</button>`).join("");
    }
  
    selectBank(selectedBank) {
        this.selectedBank = selectedBank;
        // Assuming 'financialProgram' leads to selecting business parameters,
        // and adding explicit handling for 'business' loan type
        if (this.loanType === 'financialProgram' || this.loanType === 'business') {
            this.promptForBusinessParameters(); // Call to prompt for business parameters
        } else {
            console.log('Handle other loan types or errors, current loanType:', this.loanType);
            // Optionally, handle unexpected loan types or reset state
            // this.resetCalculatorMode();
        }
        this.updateChatText(this.args.chatBox);
    }
    
    
    selectBusinessParameter(selectedParameter) {
        // Check if we're already showing the prompt for this parameter to avoid duplication.
        if (this.currentPrompt === selectedParameter) {
            return; // Do nothing if we're already on this prompt.
        }
        this.currentPrompt = selectedParameter; // Update the current prompt.
         //Your existing code to show the prompt...
        this.messages.push({ name: "Bot", alignment: "left", message: `You've chosen ${selectedParameter}. Please enter the ${selectedParameter} amount followed by monthly obligations, separated by a comma (e.g., 500000,5000).` });
        //this.updateChatText(this.args.chatBox);
    }

    // Reset currentPrompt when necessary, for example, when switching modes or completing an action.
    resetPrompt() {
        this.currentPrompt = null;
    }

       // New method to generate profession buttons HTML
       generateProfessionButtonsHTML() {
        const professions = ["BAMS", "BHMS", "BDS", "MBBS", "MD", "MS"];
        return professions.map(profession => `<button class="profession-button" data-profession="${profession}" onclick="window.chatBoxInstance.selectProfession('${profession}')">${profession}</button>`).join("");
    }

    showLoanStatusQuestion() {
        // Method to display loan status question with Yes/No buttons
        this.messages.push({
            name: "Bot",
            alignment: "left",
            message: `<div id="loanStatusQuestion">
                        <p>Are you currently running any loan?</p>
                        <button class="loan-button" data-loan="yes" onclick="window.chatBoxInstance.selectLoan('yes')">Yes</button>
                        <button class="loan-button" data-loan="no" onclick="window.chatBoxInstance.selectLoan('no')">No</button>
                      </div>`
        });
        this.updateChatText(this.args.chatBox);
    }

     // New method to handle profession selection
     selectProfession(selectedProfession) {
        this.profession = selectedProfession;
        // Ask the next question based on the profession selection
        this.messages.push({ name: "System", alignment: "left", message: "How many years of experience do you have?" });
        this.step++; // Move to the next step
        this.updateChatText(this.args.chatBox);
    }


    generateLoanButtonsHTML() {
        return `
            <button class="loan-button" onclick="window.chatBoxInstance.selectLoan('yes')">Yes</button>
            <button class="loan-button" onclick="window.chatBoxInstance.selectLoan('no')">No</button>
        `;
    }

    selectLoan(hasLoan) {
        this.hasRunningLoan = hasLoan === "yes";
        // Now, adjust your logic based on this correct state
        this.calculateProfessionalLoan();
        this.updateChatText(this.args.chatBox);
    }
    

 // New method to handle profession selection
    selectProfession(selectedProfession) {
        this.profession = selectedProfession;
        // Ask the next question based on the profession selection
        this.messages.push({ name: "System", alignment: "left", message: "How many years of experience do you have?" });
        this.step++; // Move to the next step
        this.updateChatText(this.args.chatBox);
    }

    selectBusinessParameter(selectedParameter) {
        this.businessLoanParameter = selectedParameter;
        // Log to console to verify that the method is called
        console.log(`Business parameter selected: ${selectedParameter}`);
        this.messages.push({ name: "Bot", alignment: "left", message: `You've selected ${selectedParameter}. Please enter the amount:` });
        this.step = 2; // Assuming step 2 is where you enter the amount for the selected parameter
        this.updateChatText(this.args.chatBox);
    }
    
        
    calculateProfessionalLoan() {
        // Initialize base eligibility amount
        let baseEligibilityAmount = 0;
    
        // If the user has a running loan, set a fixed loan amount
        if (this.hasRunningLoan) {
            baseEligibilityAmount = 2000000; // Fixed amount for users with a running loan
        } else {
            // Calculate base eligibility based on profession and experience for users without a running loan
            switch (this.profession) {
                case "BAMS":
                case "BHMS":
                case "BDS":
                    baseEligibilityAmount = this.experience > 9 ? 1000000 : this.experience * 100000;
                    break;
                case "MBBS":
                    baseEligibilityAmount = this.experience > 10 ? 3000000 : (this.experience > 2 ? this.experience * 200000 : 500000);
                    break;
                case "MD":
                case "MS":
                    baseEligibilityAmount = this.experience <= 10 ? 3500000 : 5000000;
                    break;
                default:
                    baseEligibilityAmount = 0; // Handle unexpected profession
                    break;
            }
        }
    
        // Cap the eligibility amount to a maximum, if necessary
        baseEligibilityAmount = Math.min(baseEligibilityAmount, 5000000);
    
        // Output the eligibility message with the calculated amount
        this.messages.push({
            name: "System",
            alignment: "left",
            message: `Based on the information provided, your eligibility amount for a professional loan is: ${baseEligibilityAmount.toLocaleString()}.`
        });
    
        this.updateChatText(this.args.chatBox);
    }
    
    
    

        calculatePersonalLoan() {
            const bankFoir = bankFoirMapping[this.selectedBank];
            let foir = this.totalSalary < 50000 ? bankFoir["foir_low"] : bankFoir["foir_high"];
            let eligibilityAmount = ((foir / 100) * this.totalSalary - this.totalObligation) * 50;
            eligibilityAmount = Math.min(eligibilityAmount, 3000000);

            this.messages.push({ name: "System", message: `Eligibility Amount for Personal Loan: ${eligibilityAmount}` });
           // this.messages.push({ name: "Bot", message: `Based on the information provided, your eligibility amount for a personal loan is approximately: ${eligibilityAmount.toLocaleString()}.` });
            this.mode = 'chat'; // Optionally switch back to chat mode after calculation
            this.resetCalculatorMode(); // Ensure to reset the mode
            this.updateChatText(); // Make sure this is here to update the chat with the calculation result
        }
  
        calculateBusinessLoan(amount, obligations) {
            let eligibilityAmount = 0;
            const bankMultipliers = {
                "HDFC": { "turnover": 15, "netprofit": 3.5, "grossprofit": 3 },
                "ICICI": { "turnover": 20, "netprofit": 5, "grossprofit": 2.5 },
                "BAJAJ": { "turnover": 10, "netprofit": 4, "grossprofit": 2 }
            };
            const multipliers = bankMultipliers[this.selectedBank];
        
            switch(this.businessLoanParameter) {
                case "turnover":
                    eligibilityAmount = (amount * multipliers.turnover / 100 - obligations) * 100;
                    break;
                case "netprofit":
                    eligibilityAmount = (amount * multipliers.netprofit - obligations) * 100;
                    break;
                case "grossprofit":
                    eligibilityAmount = (amount * multipliers.grossprofit - obligations) * 100;
                    break;
                default:
                    this.messages.push({ name: "Bot", message: "An error occurred. Please start over." });
                    return;
            }
            this.messages.push({ name: "Bot", alignment: "left",message: `Based on the information provided, your eligibility amount for a business loan with ${this.selectedBank} is: ${eligibilityAmount.toLocaleString()}.` });
            this.updateChatText();
        }
        

        resetBusinessLoanProcess() {
            this.amount = null; // Reset the stored amount
            this.step = 1; // Reset step to initial state for business loan
            this.mode = 'chat'; // Optionally, switch back to chat mode or another appropriate mode
        }

        calculateEmi() {
            const emi = this.loanAmount * this.interestRate * (Math.pow(1 + this.interestRate, this.loanTenure) / (Math.pow(1 + this.interestRate, this.loanTenure) - 1));
            this.messages.push({ name: "System", message: `Your monthly EMI is: ${emi.toFixed(2)}.` });
        }

        calculateAverageBalance() {
            const averageBalance = this.balanceDates.reduce((acc, curr) => acc + curr, 0) / this.balanceDates.length;
            this.messages.push({ name: "Bot", message: `Your average balance is: ${averageBalance.toFixed(2)}.` });
            // Reset for next calculation or query
            this.mode = 'chat';
            this.balanceDates = [];
            this.updateChatText(this.args.chatBox);
        }
       
    resetCalculatorMode() {
            this.loanType = null;
            this.businessLoanParameter = null;
            this.balanceDates = [];
            this.step = 1; // Reset the step for a fresh start
        }

        updateChatText() {
            const chatMessages = this.args.chatBox.querySelector('.chatbox__messages');
            let html = this.messages.slice().reverse().map(item => {
                const alignmentClass = item.alignment === "left" ? "messages__item--left" : "messages__item--right";
                return `<div class="messages__item ${alignmentClass}">${item.message}</div>`;
            }).join('');
            chatMessages.innerHTML = html;
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        evaluateScripts() {
            // Find all script elements in the chatbox messages
            const scripts = this.args.chatBox.querySelectorAll('.chatbox__messages script');
            scripts.forEach(script => {
                // Create a new script element
                const newScript = document.createElement('script');
        
                // Copy all attributes of the original script to the new script
                Array.from(script.attributes).forEach(attr => {
                    newScript.setAttribute(attr.name, attr.value);
                });
        
                // If the script has content (inline script), use textContent to transfer it
                if (script.textContent) {
                    newScript.textContent = script.textContent;
                }
        
                // Replace the old script with the new script in the DOM
                // This step is necessary because scripts that are dynamically added to the DOM
                // are not executed automatically
                script.parentNode.replaceChild(newScript, script);
            });
        }
        
 }
    const chatBoxInstance = new Chatbox();
    window.chatBoxInstance = chatBoxInstance;

    $(document).ready(function() {
        $('#bankSelection').hide();
        // Initially hide all option groups except for the main questions
        $('.chatbox__messages div').not('#mainQuestion').hide();
        $('.bank-button').on('click', function() {
            const selectedBank = $(this).attr('data-bank');
            window.chatBoxInstance.selectedBank = selectedBank; // Set the selected bank
            // Now, you can call the function to calculate the loan based on the selected bank
            window.chatBoxInstance.calculatePersonalLoan(); // Example function call
            // Hide the bank selection div and show the next part of the chat
            $('#bankSelection').hide();
            // You may need to manually call updateChatText or similar here, depending on your setup
        });

    
        
         window.showQuestion = function(section) {
            if(section === 'emi') {
                window.chatBoxInstance.promptForEmiDetails();
            } else if (section === 'queries') {
                // Instead of redirecting, switch to chat mode
                window.chatBoxInstance.switchToChatMode();
            } else {
                // Hide all sections first
                $('.chatbox__messages div').hide();
                // Show the selected section
                $('#' + section).show();
            }
    };

 // Modify the existing directTo function
window.directTo = function(loanType) {
    chatBoxInstance.loanType = loanType; // Set the loan type
    chatBoxInstance.mode = 'calculator'; // Switch to calculator mode

    if (loanType === 'degreeProgram') {
        // Degree Program follows the professional loan flow
        chatBoxInstance.promptForProfessionalLoan();
    } else if (loanType === 'financialProgram') {
        // Financial Program now directly triggers business loan logic
        chatBoxInstance.promptForBusinessLoan(); // Modified to direct to business loan
    } else {
        // For other loan types, use the existing dynamic method calling
        chatBoxInstance[`promptFor${loanType.charAt(0).toUpperCase() + loanType.slice(1)}Loan`]();
    }
};

     // Add average balance button functionality in showQuestion function
     window.showQuestion = function(section) {
        $('.chatbox__messages div').hide(); // Hide all sections
        if(section === 'emi') {
            window.chatBoxInstance.promptForEmiDetails();
        } else if (section === 'averageBalance') {
            // New case for handling average balance
            window.chatBoxInstance.promptForAverageBalance();
        } else if (section === 'queries') {
            window.chatBoxInstance.switchToChatMode();
        } else {
            $('#' + section).show();
        }
    };
     
    window.showProfessionalOptions = function() {
        $('.chatbox__messages div').hide(); // Hide current view
        // Display new buttons for choosing between Degree Program and Financial Program
        $('#employmentType').html(`
            <p>Choose one program:</p>
            <button onclick="directTo('degreeProgram')">Degree Program</button>
            <button onclick="directTo('financialProgram')">Financial Program</button>
        `).show();
    };
    
    // Modify the existing directTo function
    window.directTo = function(loanType) {
        chatBoxInstance.loanType = loanType; // Set the loan type
        chatBoxInstance.mode = 'calculator'; // Switch to calculator mode
        
        if (loanType === 'degreeProgram') {
            // Degree Program follows the professional loan flow
            chatBoxInstance.promptForProfessionalLoan();
        } else if (loanType === 'financialProgram') {
            // Financial Program follows the business loan flow
            chatBoxInstance.promptForBusinessLoan();
        } else {
            // For other loan types, use the existing dynamic method calling
            chatBoxInstance[`promptFor${loanType.charAt(0).toUpperCase() + loanType.slice(1)}Loan`]();
        }
    };
    // Extend the Chatbox class or its initialization to handle the average balance
    Chatbox.prototype.promptForAverageBalance = function() {
        this.mode = 'average balance'; // Set mode
        this.balanceDates = []; // Reset balance array
        this.step = 1; // Reset step for collecting balances
        this.messages.push({ name: "System", alignment: "left", message: "Please enter your balance on the 5th." });
        this.updateChatText(this.args.chatBox);
    };

    // Modify existing logic to handle average balance input collection
    // Add or modify methods as necessary, for example:
    Chatbox.prototype.handleAverageBalanceMode = function(text) {
        const balance = parseFloat(text);
        if (!isNaN(balance) && balance >= 0) {
            this.balanceDates.push(balance);
            const dates = ["5th", "10th", "15th", "20th", "25th", "30th"];
            if (this.balanceDates.length < 6) {
                this.messages.push({ name: "Bot", alignment: "left", message: `Please enter your balance on the ${dates[this.balanceDates.length]}.` });
            } else {
                this.calculateAverageBalance();
            }
        } else {
            this.messages.push({ name: "Bot", alignment: "left", message: "Please enter a valid balance amount." });
        }
        this.updateChatText(this.args.chatBox);
    };

    // Implement the calculateAverageBalance method
    Chatbox.prototype.calculateAverageBalance = function() {
        const averageBalance = this.balanceDates.reduce((acc, curr) => acc + curr, 0) / this.balanceDates.length;
        this.messages.push({ name: "Bot", alignment: "left", message: `Your average balance is: ${averageBalance.toFixed(2)}.` });
        this.mode = 'chat'; // Reset to chat mode
        this.updateChatText(this.args.chatBox);
    };
   
    Chatbox.prototype.promptForLoanDetails = function(loanType) {
        // Reset any previous state specific to loan details to ensure a fresh start
        this.resetCalculatorMode(); // Example reset method, adjust according to your implementation
    
        // Setting up different questions or steps based on the program
        switch (loanType) {
            case 'financialProgram':
                // Example of setting up for financial program flow
                // Assuming the financialProgram requires bank selection first
                this.messages.push({ name: "Bot", alignment: "left", message: "Please select your bank: " + this.generateBankButtonsHTML()});
                this.updateChatText(); // Make sure the chat is updated with the new message
                // Note: The actual selection of a bank and further steps should be handled
                // in the event listeners for the dynamically added bank selection buttons.
                break;
    
            case 'businessLoan':
                // Prompt for bank selection directly or any initial step specific to business loans
                this.promptForBankSelection();
                break;
    
            case 'personalLoan':
                // Start personal loan flow with specific prompts
                this.promptForPersonalLoan();
                break;
    
            case 'professionalLoan':
                // Start professional loan flow, maybe asking for the profession first
                this.promptForProfessionalLoan();
                break;
    
            default:
                // Handle unexpected loan types or reset to a safe state
                this.messages.push({ name: "Bot", alignment: "left", message: "Please select a valid loan type from the menu." });
                this.updateChatText();
                break;
        }
    };
    
    // Make sure to implement or adjust the `resetCalculatorMode` method to clean up any state specific to previous loan calculations or prompts.
    Chatbox.prototype.resetCalculatorMode = function() {
        // Reset or clear properties related to calculator mode
        this.loanType = null;
        this.businessLoanParameter = null;
        // Add more resets as necessary based on the properties used in your calculator modes
        this.step = 1; // Reset the step to the beginning
        // Clear any specific messages or states if needed
    };
    

    // Initially hide all option groups except for the main questions
    $('.chatbox__messages div').not('#mainQuestion').hide();

});
  
    // Bank FOIR Mapping
    const bankFoirMapping = {
        "HDFC": {"foir_low": 50, "foir_high": 80},
        "ICICI": {"foir_low": 65, "foir_high": 90},
        "Kotak": {"foir_low": 60, "foir_high": 50},
        "Axis": {"foir_low": 60, "foir_high": 70},
        "YES": {"foir_low": 65, "foir_high": 75},
        "Bajaj": {"foir_low": 65, "foir_high": 70},
        "TATA": {"foir_low": 70, "foir_high": 70},
        "Chola": {"foir_low": 65, "foir_high": 70},
        "L&T": {"foir_low": 65, "foir_high": 70},
        "Godrej": {"foir_low": 65, "foir_high": 70},
    };
});

