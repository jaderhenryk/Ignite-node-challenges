# Daily Diet API

The Daily Diet API it's a project developed as a challenge in NodeJS path from Rocketseat, the goal it's to create a complete API that allows a user create a account and register their meals along the day. The user can only access the information from his own meals.

## Tech Stack used
- Node.js
- Typescript
- Knex (for friendly queries)
- Postgresql

## What user can do on this API

- Users
	- [Post] Create new user
    - Login
        - [Post] Create a session
    - Metrics
	    - [Get] Retrieve some metrics about user's meals
- Meals
	- [Post] Create a new meal
	- [Get] Get the information about a specific user's meal
	- [Get] List of all meals from one user
	- [Put] Edit a meal
	- [Delete] Delete a meal

## To create a user

    {
    	"name": "Jack Ryan Jr",
    }

## To create a meal

    {
    	"name": "Pizza",
    	"description": "An amazing pizza to put end on your diet",
    	"moment": "2023-04-01T14:20:00",
    	"on_diet": false
    }