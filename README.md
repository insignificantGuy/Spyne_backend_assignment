# Spyne Assignment Backend

## Introduction

The following project is a part of Spyne's assignment. I have developed a project **variable** where the user can log in, sign up, and post discussions.

As a part of the assignment, this project supports the following functionalities:

* User can sign up with their email.
* User can log in with email ID and password.
* User can update their details.
* Users can view other users and follow them.
* Users can create discussion posts that contain images and text. Users can also give tags to each post.
* Users can view discussion post by other users and can also like and comment on them.
* User can see who has liked and commented on their posts.
* User can reply to comments as well.
* User can delete their comments.
* User can update any discussion post which was written by them.
* User can delete any discussion posts.
* User can search for other posts by using "text" which is present in a discussion post.
* Users can search for other posts by using Tags.
* User can delete their account if they do not like the application. Deleting the account deletes all posts, comments, and likes by the user.

## How to get started on this project.
* Clone the github repo.
* Run ```npm install``` to install all dependencies.
* Go to [atlas](https://www.mongodb.com/cloud/atlas/register) and create a cluster. This will be your database.
* Follow this [guideline](https://www.mongodb.com/resources/products/fundamentals/mongodb-cluster-setup) to create cluster.
* To connect to your cluster in nodeJS follow this [documentation](https://www.mongodb.com/docs/drivers/node/current/quick-start/).
* Create an ```.env``` file similar to ```.env_sample```.
* Run ```npm start``` which will start the server.
* Go to postman to test all API's.

## Related Documents
* [API Documentation](https://docs.google.com/document/d/16TmXNqMqiuNNwG_d8q408RiMK7Fq_66ISoZT2zHLrAA/edit)
* [Low Level Design]()
* [Postaman workspace](https://app.getpostman.com/join-team?invite_code=876ddcc98e91cc70464692c0acfdb1ee&target_code=8323c7b749589cd7007dbba70a1963ad)
* [Database Schema Explanation](https://drive.google.com/file/d/1ne6pdzPEPrULewQ3RRthcJOq5ZeAbeKP/view?usp=sharing)