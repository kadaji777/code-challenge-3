const baseURL = 'http://localhost:3000';

// Function to fetch movie details by ID
async function fetchMovieDetails(movieId) {
    const response = await fetch(`${baseURL}/films/${movieId}`);
    const movieData = await response.json();
    return movieData;
}

// Function to fetch all movies
async function fetchAllMovies() {
    const response = await fetch(`${baseURL}/films`);
    const moviesData = await response.json();
    return moviesData;
}

// Function to buy tickets for a movie
async function buyTickets(movieId, numberOfTickets) {
    const movie = await fetchMovieDetails(movieId);
    if (movie.capacity - movie.tickets_sold < numberOfTickets) {
        console.log('Sorry, not enough tickets available.');
        return;
    }

    const updatedTicketsSold = movie.tickets_sold + numberOfTickets;
    const response = await fetch(`${baseURL}/films/${movieId}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            tickets_sold: updatedTicketsSold
        })
    });

    if (!response.ok) {
        console.log('Error purchasing tickets.');
        return;
    }

    // Post new tickets to tickets endpoint
    const ticketsResponse = await fetch(`${baseURL}/tickets`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            film_id: movieId,
            number_of_tickets: numberOfTickets
        })
    });

    if (!ticketsResponse.ok) {
        console.log('Error posting new tickets.');
        return;
    }

    console.log(`Successfully purchased ${numberOfTickets} tickets for ${movie.title}.`);
}

// Function to delete a movie
async function deleteMovie(movieId) {
    const response = await fetch(`${baseURL}/films/${movieId}`, {
        method: 'DELETE'
    });

    if (response.ok) {
        console.log('Movie deleted successfully.');
        // Refresh movies list after deletion
        init();
    } else {
        console.log('Error deleting movie.');
    }
}

// Function to display movie details
function displayMovieDetails(movie) {
    const detailsContainer = document.getElementById('movie-details');
    detailsContainer.innerHTML = `
        <h2>${movie.title}</h2>
        <img src="${movie.poster}" alt="${movie.title} Poster">
        <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
        <p><strong>Showtime:</strong> ${movie.showtime}</p>
        <p><strong>Description:</strong> ${movie.description}</p>
        <p><strong>Available Tickets:</strong> ${movie.capacity - movie.tickets_sold}</p>
        <button id="buy-ticket">Buy Ticket</button>
        <button id="delete-movie">Delete Movie</button>
    `;

    // Add event listener for buying tickets
    const buyTicketButton = document.getElementById('buy-ticket');
    buyTicketButton.addEventListener('click', () => {
        const numberOfTickets = parseInt(prompt('Enter number of tickets to buy:'));
        if (!isNaN(numberOfTickets) && numberOfTickets > 0) {
            buyTickets(movie.id, numberOfTickets);
        } else {
            console.log('Invalid number of tickets.');
        }
    });

    // Add event listener for deleting movie
    const deleteMovieButton = document.getElementById('delete-movie');
    deleteMovieButton.addEventListener('click', () => {
        const confirmDelete = confirm(`Are you sure you want to delete "${movie.title}"?`);
        if (confirmDelete) {
            deleteMovie(movie.id);
        }
    });
}

// Function to display movies list
function displayMoviesList(movies) {
    const filmsList = document.getElementById('films');
    filmsList.innerHTML = '';
    movies.forEach(movie => {
        const listItem = document.createElement('li');
        listItem.textContent = movie.title;
        if (movie.tickets_sold >= movie.capacity) {
            listItem.classList.add('sold-out');
        }
        listItem.addEventListener('click', async () => {
            const selectedMovie = await fetchMovieDetails(movie.id);
            displayMovieDetails(selectedMovie);
        });
        filmsList.appendChild(listItem);
    });
}

// Function to initialize the app
async function init() {
    // Fetch and display all movies
    const movies = await fetchAllMovies();
    displayMoviesList(movies);
}

// Initialize the app
init();
