# Video: Everything You NEED to Know About WEB APP Architecture
Source: https://www.youtube.com/watch?v=sDlCSIDwpDs

## Segment 1: Architecture Definition
> "the web app architecture of a system describes its major components their relationships and how they interact with each other it essentially serves as a blueprint the layout of it all"

## Segment 2: Client-Server Architecture Basics
> "so let's take the web app we typically have the client side or front-end the server side or back-end the database and everything in between"

## Segment 3: Application Tiers
[BRANCHING]
> "a one-tier application will have all of this on a single machine a two-tier application can be split one of two ways with all of the code so the client side and then the server side business logic living on one machine and the database living on a second machine or the client side living on one machine and then the server side business logic and database living on the second machine that's two tier what you're looking at now is three tier with each individual section being in its own machine and finally you have n-tier which is anything more than a three-tier application"

## Segment 4: HTTP Request-Response Flow
> "on the client side as you interact with the web application it'll send an http request to the server the business logic which will then query the database if needed which will respond with that data which then we will transform that data as needed to send an http response back to the client"

## Segment 5: YouTube Real World Example
[BRANCHING]
> "when you're on youtube.com and you saw this video pop up and you clicked on this video you send an http request from the client side which is what you see to the server side which is what you don't see unless something has gone terribly wrong in order to access the business logic the database and everything that you need in order to populate the webpage that you're on right now which contains the video the description all of the metadata the comment section the recommendation system"

## Segment 6: Client-Server vs Peer-to-Peer
[BRANCHING]
> "there is something that opposes client server architecture and that is known as peer-to-peer architecture... peer-to-peer architecture is the base of blockchain technology it is a network of computers also known as nodes that are able to communicate with each other without the need of a central server like that of client server architecture so it rules out the possibility of single point failure"

## Segment 7: Facebook Outage Example
> "when facebook and everything that facebook owned whatsapp instagram went down for a day because their servers failed that is one of the negatives of client server in one of the avoidances or solutions that peer-to-peer provides"

## Segment 8: Monolithic Architecture
> "in a monolithic architecture all the modules will be coded in a single codebase tightly coupled together"

## Segment 9: Microservices Architecture
[BRANCHING]
> "this is unlike the microservices architecture where every distinct feature of an application may have one or more dedicated services"

## Segment 10: Architecture Decision Starting Point
> "one of the most important aspects of software development is the architecture of your application which is basically the blueprint for how the web app is structured think about the first decent size app you ever built i'd be willing to bet that you unknowingly implemented the monolithic architecture"

## Segment 11: Scaling Consideration
[BRANCHING]
> "if you want to efficiently scale your app from a hundred users to 100,000 users then maybe you want to take a look at microservice architecture but that's not all there is to consider in terms of architecture i mean how many tiers is your application where does each component live all on the same server each have their own server are you going with a serverless architecture"
