# Simple Calendar Web Application

A modern, responsive web-based calendar application that allows users to manage events and appointments with a clean, intuitive interface.

## Features

- Monthly calendar view with navigation
- User authentication system
- Event management:
  - Add events with custom colors
  - Set event time and description
  - Delete existing events
  - View all events for a specific date
- Persistent storage using localStorage
- Modern UI with smooth animations and transitions
- Secure event viewing (only visible when logged in)

## Technologies Used

- HTML5
- CSS3 
- JavaScript
- Local Storage for data persistence

## Setup Instructions

1. Clone the repository:
   ```bash
   git clone [repository-url]
   ```

2. Navigate to the project directory:
   ```bash
   cd calendar-app
   ```

3. Open `Calendar.html` in your web browser:
   - Double-click the file
   - Or use a local server (recommended)

## Usage Guide

### Viewing the Calendar
1. Open the application in your web browser
2. Navigate between months using the arrow buttons
3. The current month and year are displayed at the top

### User Authentication
1. Click the "Login" button in the top-right corner
2. Enter your username and password
3. Click "Submit" to log in
4. Your username will be displayed in the header
5. Click "Logout" to end your session

### Managing Events
1. Log in to access event management features
2. Click on any day to add an event
3. In the event modal:
   - Enter event description
   - Select event time
   - Choose event color
   - Click "Save Event"
4. View existing events by clicking on a day
5. Delete events using the delete button next to each event

## Project Structure

```
calendar-app/
├── Calendar.html    # Main HTML file
├── styles.css       # CSS styles
├── app.js          # JavaScript functionality
└── README.md       # This file
```


## Local Storage

Events are automatically saved to the browser's localStorage, so they persist between sessions. The data structure is:

```javascript
{
  date: "YYYY-MM-DD",
  events: [
    {
      time: "HH:MM",
      reason: "Event description",
      color: "#HEXCOLOR"
    }
  ]
}
```


## License

This project is licensed under the MIT License - see the LICENSE file for details.


