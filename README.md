# Spotify Data Visualizer

This project displays Spotify data such as top tracks, top artists, followed playlists, etc.

NOTICE:

This project is still in development

## Installation

Clone the repository

### Using your own credentials
You will need to register your app and get your own credentials from the Spotify for Developers Dashboard.

To do so, go to [your Spotify for Developers Dashboard](https://beta.developer.spotify.com/dashboard) and create your application. For the examples, we registered these Redirect URIs:

* http://localhost:5501/public/index.html (needed for the implicit grant flow)

Once you have created your app, replace the `client_id`, `redirect_uri` and `client_secret` with the ones you get from My Applications.

## Running the program
In order to run the application, run `index.html` with live server.

Then, open `http://localhost:5501/public/index.html` in a browser.
