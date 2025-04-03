// Main entry point - logs when the application starts
console.log('app.js is loaded');

// DOM Element References
// Calendar navigation and display elements
const calendarGrid = document.getElementById('calendar-grid');
const monthYearDisplay = document.getElementById('month-year');
const prevMonthButton = document.getElementById('prev');
const nextMonthButton = document.getElementById('next');

// Event modal elements for adding/editing events
const modal = document.getElementById('event-modal');
const closeModal = document.getElementById('closeModal');
const eventReasonInput = document.getElementById('event-reason');
const eventTimeInput = document.getElementById('event-time');
const saveEventButton = document.getElementById('save-event');
const deleteEventButton = document.getElementById('delete-event');
const eventColorInput = document.getElementById('event-colour');

// Login modal and user interface elements
const loginModal = document.getElementById('login-modal');
const closeLoginModal = document.getElementById('closeLoginModal');
const loginButton = document.getElementById('login-button');
const submitLoginButton = document.getElementById('submit-login');
const userInfo = document.getElementById('user-info');
const usernameDisplay = document.getElementById('username-display');

// Application State
let currentDate = new Date();   // Tracks the currently displayed month
let bookedDates = JSON.parse(localStorage.getItem('bookedDates')) || []; // Stores all calendar events
let selectedDate = null;       // Tracks the currently selected date for event operations
let isLoggedIn = false;       // Tracks user authentication state

// Debug logging for initial state
console.log('bookedDates from localStorage: ', bookedDates);

// Debug logging for DOM element verification
console.log('Initial DOM elements check:');
console.log('loginButton:', loginButton);
console.log('loginModal:', loginModal);
console.log('calendarGrid:', calendarGrid);

console.log('DOM Elements check:');
console.log('Calendar container:', document.getElementById('calendar-container'));
console.log('Calendar grid:', calendarGrid);
console.log('Login button:', loginButton);
console.log('Login modal:', loginModal);

/**
 * Renders the calendar grid for the current month
 * Handles day cell creation, event display, and interaction setup
 */
function renderCalendar() {
    console.log('Rendering calendar');
    if (!calendarGrid) {
        console.error('Calendar grid element not found!');
        return;
    }
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    monthYearDisplay.textContent = `${currentDate.toLocaleString('default', { month: 'long' })} ${year}`;

    // Clear the days of the month
    const days = document.querySelectorAll('.day:not(.day-header)');
    days.forEach(day => day.remove());

    // First day and number of days in the month
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('day');
        calendarGrid.appendChild(emptyCell);
    }

    // Fill in the days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayCell = document.createElement('div');
        dayCell.classList.add('day');
        dayCell.textContent = day;
        dayCell.dataset.date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Check if day is booked
        const eventsForDay = bookedDates.find(event => event.date === dayCell.dataset.date);
        if (eventsForDay && isLoggedIn) { // Only show events if logged in
            const events = Array.isArray(eventsForDay.events) ? eventsForDay.events : [];
            events.forEach(event => {
                const eventLabel = document.createElement('div');
                eventLabel.textContent = `${event.time} - ${event.reason}`;
                eventLabel.classList.add('event');
                eventLabel.style.backgroundColor = event.color;
                eventLabel.style.color = 'white';
                dayCell.appendChild(eventLabel);
            });
        }

        // Only allow clicking to add events if logged in
        if (isLoggedIn) {
            dayCell.addEventListener('click', () => {
                console.log('day cell clicked:', dayCell.dataset.date);
                openModal(dayCell.dataset.date);
            });
        }
        calendarGrid.appendChild(dayCell);
    }

    console.log('Calendar rendered:', calendarGrid.children.length, 'cells');
}

/**
 * Opens the event modal for a selected date
 * Displays existing events and allows adding new ones
 * @param {string} date - The selected date in YYYY-MM-DD format
 */
function openModal(date) {
    try {
        selectedDate = date;
        calendarGrid.classList.add('no-interaction');

        // Ensure the date is in the format YYYY-MM-DD
        const [year, month, day] = date.split('-');
        const formattedDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

        // Create a date object using UTC to avoid time zone issues
        const parsedDate = new Date(Date.UTC(year, month - 1, day));
        if (isNaN(parsedDate)) {
            throw new Error(`Invalid date format: ${date}`);
        }

        const formattedDisplayDate = parsedDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            timeZone: 'UTC' 
        });

        // Update the modal header to include the formatted date
        const modalHeader = document.getElementById('modal-header');
        if (!modalHeader) {
            throw new Error("Modal header element not found.");
        }
        modalHeader.textContent = `Events for ${formattedDisplayDate}`;

        // Clear the input fields at the start
        if (!eventReasonInput || !eventTimeInput) {
            throw new Error("Input elements not found.");
        }
        eventReasonInput.value = '';
        eventTimeInput.value = '';

        const eventsForDay = bookedDates.find(event => event.date === date);

        let eventList = document.getElementById('event-list');
        if (!eventList) {
            eventList = document.createElement('div');
            eventList.id = 'event-list';
            const modalContent = modal.querySelector('.modal-content');
            if (!modalContent) {
                throw new Error("Modal content element not found.");
            }
            modalContent.appendChild(eventList);
        } else {
            eventList.innerHTML = ''; // Clear previous events
        }

        if (eventsForDay && Array.isArray(eventsForDay.events) && eventsForDay.events.length > 0) {
            deleteEventButton.style.display = 'none'; 

            eventsForDay.events.forEach((event, index) => {
                const eventItem = document.createElement('div');
                eventItem.textContent = `${event.time} - ${event.reason}`;
                eventItem.classList.add('event-item');

                // Create delete button for each event
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.classList.add('delete-event-btn');
                deleteButton.addEventListener('click', () => deleteSpecificEvent(date, index));

                eventItem.appendChild(deleteButton);
                eventList.appendChild(eventItem);
            });
        } else {
            deleteEventButton.style.display = 'none';
        }

        modal.style.display = 'block';
        document.getElementById('calendar-container').classList.add('blur');
    } catch (error) {
        console.error("Error in openModal function:", error.message);
        alert("An error occurred while opening the event modal. Please try again.");
    }
}

/**
 * Closes the event modal and resets the UI state
 */
function closeModalHandler() {
    modal.style.display = 'none';
    selectedDate = null;

    calendarGrid.classList.remove('no-interaction');

    document.getElementById('calendar-container').classList.remove('blur');
}

/**
 * Saves a new event to the calendar
 * Validates input and checks for time conflicts
 * Updates localStorage with the new event
 */
function saveEvent() {
    console.log('Saving event...');
    console.log('Selected date:', selectedDate);
    console.log('Event reason input:', eventReasonInput.value);
    console.log('Event time input:', eventTimeInput.value);
    console.log('Event color input:', eventColorInput.value);

    if (!selectedDate || !eventReasonInput.value.trim() || !eventTimeInput.value) {
        console.log('Validation failed: missing date, reason, or time');
        alert('Please fill in all fields before saving');
        return;
    }

    const newEvent = {
        time: eventTimeInput.value,
        reason: eventReasonInput.value.trim(),
        color: eventColorInput.value 
    };

    console.log('New event:', newEvent);

    let dateEntry = bookedDates.find(event => event.date === selectedDate);
    if (dateEntry) {
        const isTimeOverlap = dateEntry.events.some(event => event.time === newEvent.time);
        if (isTimeOverlap) {
            alert('An event is already booked for this time. Please choose a different time.');
            console.log('Time overlap detected');
            return;
        }
        dateEntry.events.push(newEvent);
    } else {
        bookedDates.push({ date: selectedDate, events: [newEvent] });
        console.log('Added new event');
    }

    localStorage.setItem('bookedDates', JSON.stringify(bookedDates));
    console.log('Updated bookedDates in localStorage:', bookedDates);
    renderCalendar();
    closeModalHandler();
}

/**
 * Deletes a specific event from a given date
 * @param {string} date - The date containing the event
 * @param {number} eventIndex - The index of the event to delete
 */
function deleteSpecificEvent(date, eventIndex) {
    console.log('Deleting specific event...');
    const dateEntryIndex = bookedDates.findIndex(event => event.date === date);

    if (dateEntryIndex !== -1) {
        bookedDates[dateEntryIndex].events.splice(eventIndex, 1);

        // Remove the date entry if no events remain
        if (bookedDates[dateEntryIndex].events.length === 0) {
            bookedDates.splice(dateEntryIndex, 1);
        }

        console.log('Event deleted successfully');
    } else {
        console.log('No entry found for the selected date');
    }

    localStorage.setItem('bookedDates', JSON.stringify(bookedDates));
    console.log('Updated bookedDates in localStorage:', bookedDates);

    renderCalendar();
    openModal(date); // Refresh modal view
}

/**
 * Opens the login modal and blurs the calendar
 */
function openLoginModal() {
    console.log('Opening login modal');
    if (!loginModal) {
        console.error('Login modal element not found!');
        return;
    }
    loginModal.style.display = 'block';
    document.getElementById('calendar-container').classList.add('blur');
}

/**
 * Closes the login modal and restores calendar visibility
 */
function closeLoginModalHandler() {
    loginModal.style.display = 'none';
    document.getElementById('calendar-container').classList.remove('blur');
}

/**
 * Handles user login
 * Validates credentials and updates UI state
 */
function handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username && password) {
        isLoggedIn = true;
        usernameDisplay.textContent = username;
        userInfo.style.display = 'block';
        loginButton.textContent = 'Logout';
        closeLoginModalHandler();
        renderCalendar(); // Re-render to show events
    } else {
        alert('Please enter both username and password');
    }
}

/**
 * Handles user logout
 * Resets UI state and clears user session
 */
function handleLogout() {
    isLoggedIn = false;
    userInfo.style.display = 'none';
    loginButton.textContent = 'Login';
    renderCalendar(); // Re-render to hide events
}

// Event Listeners
// Modal interaction handlers
closeModal.addEventListener('click', closeModalHandler);
saveEventButton.addEventListener('click', saveEvent);

// Calendar navigation handlers
prevMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
});

nextMonthButton.addEventListener('click', () => {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
});

// Login handlers
loginButton.addEventListener('click', () => {
    console.log('Login button clicked');
    console.log('isLoggedIn:', isLoggedIn);
    if (isLoggedIn) {
        handleLogout();
    } else {
        openLoginModal();
    }
});

closeLoginModal.addEventListener('click', closeLoginModalHandler);

// Initialize login submission handler
if (submitLoginButton) {
    submitLoginButton.addEventListener('click', handleLogin);
} else {
    console.error('Submit login button not found!');
}

// Initialize the calendar display
renderCalendar();
