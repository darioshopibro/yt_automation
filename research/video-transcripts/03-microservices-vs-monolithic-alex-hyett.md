# Video: Monolithic vs Microservice Architecture: Which To Use and When?
Source: https://www.youtube.com/watch?v=NdeTGlZ__Do

## Segment 1: What is a Monolith
> "a monolith is an application where everything works as one piece of code It's usually the starting point for any new application whether that be an API or a front end and you usually end up with one executable in one repository your application is then developed deployed and scaled as one single component"

## Segment 2: Monolith Advantages
[BRANCHING]
> "first of all monoliths are really easy to develop all your code is in one place... number two monoliths are really easy to deploy After all you've only got one application to worry about on top of that you only have one CI CD Pipeline and one infrastructure to worry about number three is that they're easier to debug if you've only got one application then you've only got one place you need to look if there's a problem... the last advantage of Monolithic architecture is around performance... with a monolith you don't need to worry about latency"

## Segment 3: Monolith Disadvantages
[BRANCHING]
> "the first is that monoliths tend to get really big... number two is that your release process is taking too long if your application has lots of different features that's a lot of different things you need to test before each release... lastly the main problem with monoliths is that they're really difficult to scale if one part of your application is getting a lot of traffic then you have no choice but to scale up the whole application"

## Segment 4: Microservices Architecture (Netflix Example)
[BRANCHING]
> "with microservices we take your big monolithic application and break it down into individual components each component has a single responsibility and is usually in charge of a single business functionality if you take Netflix for example they might have one component in charge of search another one in charge of streaming videos and another one in charge of the recommendations each service is self-contained and independent from all the others they all have their own infrastructure and their own database"

## Segment 5: Microservices Communication Methods
[BRANCHING]
> "if you split your application into microservices how do you get them all to talk to each other well there's three main ways that microservices can communicate the first is by API each microservices has its own endpoint that the other microservices can call... the second option is to use a message broker if what your application needs to do can be done asynchronously then you're better off using a message broker... the last option is what we call a service mesh a service mesh handles all of the communication as well as dealing with the discoverability and the reliability of your services"

## Segment 6: Microservices Scaling Advantage
[BRANCHING]
> "as we saw with monoliths if you have one part of your application that's getting more requests then you have no choice but to scale up your whole application but at least if it's a micro service then you can scale up that one microservice and therefore save you some money in the process"

## Segment 7: When to Use Which Architecture
[BRANCHING]
> "if you're starting out with a brand new application that isn't going into any existing infrastructure then I recommend starting on a monolith there's no point in trying to solve for scaling problems that you just don't have yet... there is one scenario where you should probably start with microservices and that's if you're hooking into an existing workflow if you know your application is going to get a million requests from day one then you need to plan accordingly"

## Segment 8: Breaking Down Monolith to Microservices
> "have a look at your monolith and see which components would make sense to run by themselves look at which parts of your application are having scaling problems and which ones can be run synchronously versus asynchronously"
