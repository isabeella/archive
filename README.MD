# Westridge Archive

## Description

This project was meant to provide a place for high schoolers to share their research and site eachothers' work easily.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Explanation of Levels](#reviewer-levels)

## Installation

Install the following dependencies:
    "compression": "^1.7.4",
    "connect-flash": "^0.1.1",
    "connect-mongo": "^5.0.0",
    "cookie-parser": "^1.4.6",
    "dotenv": "^16.0.3",
    "es6-promisify": "^5.0.0",
    "express": "^4.18.2",
    "express-session": "^1.17.3",
    "express-validator": "^5.3.0",
    "flash": "^1.1.0",
    "from-string": "^1.1.7",
    "html-to-text": "^9.0.5",
    "jimp": "^0.22.8",
    "juice": "^9.0.0",
    "md5": "^2.3.0",
    "moment": "^2.29.4",
    "mongoose": "^7.1.0",
    "mongoose-mongodb-errors": "0.0.2",
    "multer": "^1.4.5-lts.1",
    "node": "^20.1.0",
    "node-fetch": "^3.3.1",
    "nodemailer": "^6.9.1",
    "nodemon": "^2.0.22",
    "passport": "^0.6.0",
    "passport-local-mongoose": "^8.0.0",
    "pug": "^3.0.2",
    "uuid": "^9.0.0",
    "validator": "^13.9.0"
    
Example installation commands

    npm start (in your terminal)

## Usage
The configuration of the code is pretty easy to navigate and understand. Please excuse any weird methods I may have used, I wrote the majority of this code my junior year of high school and already looking back a few months later I am cringing at some of the ways I set up my code. 

Basically, anything you see on the website is in a pug file in the views folder. The basic layout of the site is in the layout.pug file and then all the other .pug files populate the content of that page. 

Any functions called run through the routes.js file to call functions in the 3 different controllers (where each individual function is written)

The basic framework of how I set up my files is based off of Wes Bos's Learn Node Premium Course

## Reviewer Levels
Level 0 = Just a site viewer, people who want to contribute articles but not review

Level 1 = Still just a site viewer, but level 1 indicates the user wants to be a reviewer

Level 2 = Reviewer

Level 3 = Reviewer + Moderator (allowed to change level 1 to level 2, not able to delete users though)

Level 4 = Reviewer + Administrator (allowed to change any user's status, access to site settings and email blasts)