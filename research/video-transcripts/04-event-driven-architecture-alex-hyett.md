# Video: Event-Driven Architecture: Explained in 7 Minutes!
Source: https://www.youtube.com/watch?v=gOuAqRaDdHA

## Segment 1: Message Queue Communication
> "when we have a system composed of lots of different microservices you need a way for them all to talk to each other one way to do this is with messages we can have one service that adds a message to a queue and then we have another service that listens to that queue and then acts on it when it receives it this is what we call a message driven architecture"

## Segment 2: Message-Driven vs Event-Driven Difference
[BRANCHING]
> "the main difference is that in event driven architecture our service will send an event after the event has happened the service raising the event doesn't care what happens after the event has been raised it doesn't care whether there's another service listening to it or not if the state has changed in your application then an event is raised"

## Segment 3: Messages vs Events
[BRANCHING]
> "a message is usually a command to do something it is designed for a particular service with instructions on what needs to be done this could be sending an email for example or running some other back-end process with an event there's not usually any instructions it's just information on what has been performed and by who"

## Segment 4: Event Handling Difference
> "the way that events are handled are slightly different as well with messages once a message has been processed is then deleted from the queue ready for the next message to come along events on the other hand are immutable they can't be changed they can't be deleted and they're a permanent record of what's happened in your application"

## Segment 5: Publisher Subscriber Model
[BRANCHING]
> "we now have a service that is publishing events but how do we get all the other services to respond to them we do this using an event broker your other services subscribe to this event broker and the broker is responsible for pushing events out to the Subscribe services this is often referred to as the publisher subscriber model or Pub sub for short when a service subscribes to the event broker they specify which events they are interested in"

## Segment 6: Three Components of Event-Driven Architecture
[BRANCHING]
> "in an event-driven architecture there's three main components there's the producer which publishes the events the broker which manages which subscribers get which events and finally there's the consumer which subscribes to the event broker to receive the events"

## Segment 7: Use Cases for Event-Driven
[BRANCHING]
> "event driven architecture is used best when a process can be run separately and doesn't have a direct consequence on the application raising the events this can be really useful for things like auditing where you need to order every single action that the user does but the application itself doesn't need to know about the audit Trail or for example back-end processes that can be run asynchronously such as maybe sending an email after someone's ordered something"

## Segment 8: Decoupling Advantage
[BRANCHING]
> "the first is it that decouples your components as the publisher doesn't need to know anything about the subscribers that are subscribing to its events they are completely decoupled from each other not only that but other services can be created they can subscribe to the same events all without the publisher needing to know compare this to one service calling another service over an API service one is now highly coupled to service two"

## Segment 9: Reliability Advantage
> "the system is also less reliable if service 2 goes down then service one doesn't work either with an event driven system service 2 can go offline without affecting service one and then when service 2 does come back online it can then pick up where it left off"

## Segment 10: Scalability Advantage
[BRANCHING]
> "the main benefit of event driven architecture is it allows your systems to scale if the number of events being published increases then you can easily spin up more subscribers to process them you can also add more functionality such as auditing or data processing without slowing down the publishing service"

## Segment 11: Eventual Consistency Problem
> "when you're using an event-based system there is always going to be a delay between when the event is published and when your subscribers pick it up this is usually one of the trade-offs that you have to put up with if you want scalability... we call this eventual consistency as your data is going to be eventually consistent with what's being published"

## Segment 12: Eventual Consistency Example
[BRANCHING]
> "for example say you're running an e-commerce site and you use an event-based system to manage the stock numbers as the system is eventually consistent this could allow two people to order the lowest item in stock or for example if you're using it to keep a history of the past orders a user could order something and then go and have a look at their orders and their latest order won't be there"

## Segment 13: Duplicate Messages Problem
> "the second disadvantage for an event-based system is around duplicate messages as I mentioned eventbrokers keep a checkpoint however for performance reasons they don't keep a checkpoint for every single event they receive which means if your service goes offline when it comes back up it will start receiving events from the last checkpoint but it might end up receiving a few duplicate events as well you therefore need to make sure that your subscribers are idempotent"
