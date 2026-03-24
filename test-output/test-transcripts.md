# Test Transcripts za Remotion Planner (20 komada)

Svaki transcript je 45sec - 2.5min (80-350 reči).
Copy-paste u drugi chat sa promptom na dnu.

---

## TEST 1: CI/CD Merge Problem + Solution (~120 reči)
**Očekivani layouti:** negation (problem→solution), flow

```
Imagine Mary, your back-end developer, builds a new API for your product. Shortly after, Jane, your front-end developer, starts work on a new UI. A few months later when it comes time to merge their features, we find that they're completely incompatible. The build fails and we now have to spend time and money resolving these conflicts.

One of the core practices of DevOps is continuous integration, which has developers commit their code to a shared repository often on a daily basis. Each commit triggers an automated workflow on a CI server that can notify developers of any issues integrating their changes.
```

---

## TEST 2: Kubernetes Orchestra + Scaling (~140 reči)
**Očekivani layouti:** flow, vs (low vs high traffic)

```
Kubernetes is a tool for managing and automating containerized workloads in the cloud. Imagine you have an orchestra. Think of each individual musician as a Docker container. To create beautiful music, we need a conductor to manage the musicians and set the tempo. Now imagine the conductor as Kubernetes and the orchestra as an app like Robinhood.

When the markets are closed, an app like Robinhood isn't doing much. But when they open, it needs to fulfill millions of trades for overpriced stocks like Tesla and Shopify. Kubernetes is the tool that orchestrates the infrastructure to handle the changing workload. It can scale containers across multiple machines, and if one fails, it knows how to replace it with a new one.
```

---

## TEST 3: Machine Learning Two Jobs + Data Pipeline (~160 reči)
**Očekivani layouti:** vs (classify vs predict), flow

```
Machine learning teaches a computer how to perform a task without explicitly programming it to perform said task. Instead, feed data into an algorithm to gradually improve outcomes with experience, similar to how organic life learns.

Predictive models are embedded in many of the products we use every day, which perform two fundamental jobs. One is to classify data, like is there another car on the road or does this patient have cancer. The other is to make predictions about future outcomes, like will the stock go up or which YouTube video do you want to watch next.

The first step in the process is to acquire and clean up data, lots and lots of data. The better the data represents the problem, the better the results. Garbage in, garbage out. The data needs to have some kind of signal to be valuable to the algorithm for making predictions.
```

---

## TEST 4: RAG Flow Simple (~130 reči)
**Očekivani layouti:** flow (query→vector→LLM)

```
RAG stands for retrieval augmented generation. A user has a question, so they create a prompt. You'll need multiple different sources of data to answer a specific question, whether that's a PDF or another business application or maybe some images.

We take this data and put it into a vector database. A vector database is a mathematical representation of structured and unstructured data, similar to arrays. These arrays are easier to understand for machine learning models versus just the underlying unstructured data.

We query our vector database and get back an embedding that includes the relevant data for which we're prompting. That feeds back into the prompt, and then once we're at this point, we move over to the large language model, which produces the output with the answer to our original question.
```

---

## TEST 5: Monolith vs Microservices Intro (~150 reči)
**Očekivani layouti:** vs (monolith vs micro)

```
A monolith is an application where everything works as one piece of code. It's usually the starting point for any new application, whether that be an API or a front end. You usually end up with one executable in one repository. Your application is then developed, deployed, and scaled as one single component.

With microservices, we take your big monolithic application and break it down into individual components. Each component has a single responsibility and is usually in charge of a single business functionality. If you take Netflix for example, they might have one component in charge of search, another one in charge of streaming videos, and another one in charge of the recommendations.

Each service is self-contained and independent from all the others. They all have their own infrastructure and their own database.
```

---

## TEST 6: GitHub Actions Pipeline (~130 reči)
**Očekivani layouti:** flow (commit→test→build→deploy)

```
Here on GitHub I have a Node.js web app. In order to deliver this out to my customers, I need to run three commands: test, build, and deploy. I can automate this entire process in the cloud by using a CI service like GitHub Actions. First I create a workflow, and then I tell it to run on every push to the master branch.

The event triggers a job that runs on a Linux container in the cloud. We tell the container what to do as a series of steps. First it checks out the code in this GitHub repo, then sets up Node.js, installs my dependencies, and runs my test, build, and deploy commands.

Now anytime we commit code to the master branch, it will run this workflow.
```

---

## TEST 7: Kubernetes Cluster Architecture (~160 reči)
**Očekivani layouti:** flow (control plane→nodes→pods)

```
A system deployed on Kubernetes is known as a cluster. The brain of the operation is known as the control plane. It exposes an API server that can handle both internal and external requests to manage the cluster. It also contains its own key-value database called etcd, used to store important information about running the cluster.

What it's managing is one or more worker machines called nodes. When you hear node, think of a machine. Each node is running something called a kubelet, which is a tiny application that runs on the machine to communicate back with the main control plane mothership.

Inside of each node we have multiple pods, which is the smallest deployable unit in Kubernetes. When you hear pod, think of a pod of whales or containers running together. As the workload increases, Kubernetes can automatically scale horizontally by adding more nodes to the cluster.
```

---

## TEST 8: ML Training vs Testing + Algorithms (~170 reči)
**Očekivani layouti:** vs (training vs testing), flow

```
The next step is to separate the data into a training set and testing set. The training data is fed into an algorithm to build a model. Then the testing data is used to validate the accuracy or error of the model.

The next step is to choose an algorithm, which might be a simple statistical model like linear or logistic regression, or a decision tree that assigns different weights to features in the data. Or you might get fancy with a convolutional neural network, which is an algorithm that also assigns weights to features but also takes the input data and creates additional features automatically.

That's extremely useful for datasets that contain things like images or natural language where manual feature engineering is virtually impossible. Every one of these algorithms learns to get better by comparing its predictions to an error function. If it's a classification problem like is this animal a cat or a dog, the error function might be accuracy.
```

---

## TEST 9: Microservices Communication (~140 reči)
**Očekivani layouti:** vs (API vs broker vs mesh)

```
If you split your application into microservices, how do you get them all to talk to each other? There's three main ways that microservices can communicate.

The first is by API. Each microservice has its own endpoint that the other microservices can call.

The second option is to use a message broker. If what your application needs to do can be done asynchronously, then you're better off using a message broker.

The last option is what we call a service mesh. A service mesh handles all of the communication as well as dealing with the discoverability and the reliability of your services.

As we saw with monoliths, if you have one part of your application that's getting more requests, then you have no choice but to scale up your whole application. But with microservices, you can scale up just that one service and save money in the process.
```

---

## TEST 10: CI/CD Benefits (~120 reči)
**Očekivani layouti:** vs (velocity vs quality)

```
DevOps is a set of practices to build, test, and release your code in small frequent steps.

Now anytime we commit code to the master branch in this repo, it will run this workflow. If any of the steps fail, the bad software won't be delivered to our customers, and we'll automatically know there's an issue that needs to be addressed.

At the end of the day, CI/CD offers two main benefits. It helps you automate things that would otherwise have to be done manually by developers. That will increase your velocity. But it also detects small problems early before they can grow into major disasters, and that results in higher code quality.
```

---

## TEST 11: Message-Driven vs Event-Driven (~150 reči)
**Očekivani layouti:** vs (message vs event)

```
When we have a system composed of lots of different microservices, you need a way for them all to talk to each other. One way to do this is with messages. We can have one service that adds a message to a queue, and then we have another service that listens to that queue and then acts on it when it receives it. This is what we call a message-driven architecture.

The main difference is that in event-driven architecture, our service will send an event after the event has happened. The service raising the event doesn't care what happens after the event has been raised. It doesn't care whether there's another service listening to it or not.

A message is usually a command to do something. It is designed for a particular service with instructions on what needs to be done. With an event, there's not usually any instructions. It's just information on what has been performed and by who.
```

---

## TEST 12: Pub/Sub Architecture (~140 reči)
**Očekivani layouti:** flow (producer→broker→consumer)

```
We now have a service that is publishing events. But how do we get all the other services to respond to them? We do this using an event broker. Your other services subscribe to this event broker, and the broker is responsible for pushing events out to the subscribed services. This is often referred to as the publisher-subscriber model, or pub-sub for short.

When a service subscribes to the event broker, they specify which events they are interested in.

In an event-driven architecture, there's three main components. There's the producer, which publishes the events. The broker, which manages which subscribers get which events. And finally, there's the consumer, which subscribes to the event broker to receive the events.
```

---

## TEST 13: ETL Pipeline (~130 reči)
**Očekivani layouti:** flow (extract→transform→load)

```
Data in an organization starts out in data lakes, it's in different databases that are part of different SaaS applications. Some applications are on-prem, and then we also have streaming data which is kind of like our river here. This can be data that is coming in real time, like sensor data from factories where data's being collected every second.

One of the most common processes is ETL, which stands for extract, transform, and load. And that does exactly what it sounds like. It extracts data from where it is. It transforms it by cleaning up mismatching data, taking care of missing values, getting rid of duplicated data, making sure the right columns are there. And then loading it into a landing repository with ready-to-use business data. An example of one of these repositories could be an enterprise data warehouse.
```

---

## TEST 14: Batch vs Stream Processing (~120 reči)
**Očekivani layouti:** vs (batch vs stream)

```
Most of the time we use something called batch processing, which means that on a given schedule we load data into our ETL tool and then load it to where it needs to be.

But we could also have stream ingestion, which would support streaming data. So it's continuously taking data in, transforming it, and then continuously loading it to where it needs to be.

After we've used all these different processes to get data ready for analysis or different applications, we can start using it. We might need it for our business intelligence platforms that are needed for different types of reporting. We might also need it for machine learning use cases, which requires tons and tons of high-quality data.
```

---

## TEST 15: RAG Problem Statement (~140 reči)
**Očekivani layouti:** negation (bad approach→solution)

```
Your company has 500 gigabytes of documents in their server, and you're asked to connect an AI assistant to answer questions about these documents. You know that typical chat applications can't accept more than a dozen files. So you have to use a different method to allow the AI to search, read, and understand the entire files.

Maybe you think you can create a clever algorithm to search the title of the documents and its contents to rank them by relevance. But you soon realize that means every time the user searches, it would need to search the entire 500 GB of documents. This is a very inefficient way to get it done.

So maybe you try something else by summarizing all documents into searchable chunks. But you also realize this isn't going to be an accurate way to get things done.
```

---

## TEST 16: RAG Three Steps (~130 reči)
**Očekivani layouti:** flow (retrieve→augment→generate)

```
In order to understand how RAG works, we need to break it down into three different steps: Retrieval, Augmented, and Generation.

Starting with retrieval, just like how we converted the documents into vector embeddings to store them into the database, we do the exact same step for the question. Once the word embedding for the question is generated, the embedding for the question is compared against the embedding of the documents.

Augmentation in RAG refers to the process where the retrieved data is injected into the prompt at runtime. Typically AI assistants rely on what they learn during pre-training, which is static knowledge that can become outdated fast. Instead, our goal is to have the AI assistant rely on up-to-date information in the vector database.

The final step of RAG is generation, where AI generates the response.
```

---

## TEST 17: Username Check - Data Structures (~160 reči)
**Očekivani layouti:** vs (hashmap vs trie vs B+tree)

```
When you are signing up for a new app, you enter your preferred username and get a message saying this username is already taken. It feels like a small inconvenience, but behind the scenes, that simple check is surprisingly complex. When you're dealing with billions of users, checking whether a username exists can't rely on a basic database query.

In Redis, a hashmap lets you store multiple field-value pairs under one key. When a user checks if a username is available, the system queries this hashmap. If the field exists, that's a cache hit and Redis returns a result instantly.

A trie is a tree-like structure that organizes strings by their shared prefixes. Instead of storing each username as a whole, it breaks them down character by character and builds a path through the tree. This allows us to perform lookups in O of M time where M is the length of the string.
```

---

## TEST 18: Bloom Filters (~140 reči)
**Očekivani layouti:** flow, if-else (check→maybe present→fallback)

```
A Bloom filter is just a bit array combined with handful of hash functions. When you add a username, it's hashed multiple times and each hash sets a corresponding bit in the array. To check a username, you hash it the same way.

If any of those bits is zero, the username is definitely not in the set. If all the bits are one, then it's probably present. And that's when you fall back to a more expensive check like a database query.

What makes Bloom filters so powerful is that they never give false negatives. If they say the username isn't present, you can trust that. The only trade-off is the possibility of false positives, but that's usually acceptable when the alternative is scoring a massive database. To store 1 billion usernames with a 1% false positive rate, you would need roughly around 1.2 GB of memory.
```

---

## TEST 19: Event-Driven Advantages (~130 reči)
**Očekivani layouti:** vs (coupled vs decoupled)

```
The first advantage is that event-driven architecture decouples your components. As the publisher doesn't need to know anything about the subscribers that are subscribing to its events. They are completely decoupled from each other. Not only that, but other services can be created, they can subscribe to the same events, all without the publisher needing to know.

Compare this to one service calling another service over an API. Service one is now highly coupled to service two.

The system is also less reliable. If service 2 goes down, then service one doesn't work either. With an event-driven system, service 2 can go offline without affecting service one. And when service 2 does come back online, it can then pick up where it left off.
```

---

## TEST 20: Eventual Consistency (~140 reči)
**Očekivani layouti:** negation (sync→eventual), if-else

```
When you're using an event-based system, there is always going to be a delay between when the event is published and when your subscribers pick it up. This is usually one of the trade-offs that you have to put up with if you want scalability. We call this eventual consistency, as your data is going to be eventually consistent with what's being published.

For example, say you're running an e-commerce site and you use an event-based system to manage the stock numbers. As the system is eventually consistent, this could allow two people to order the last item in stock.

Or for example, if you're using it to keep a history of past orders, a user could order something and then go look at their orders, and their latest order won't be there yet.
```

---

# PROMPT ZA DRUGI CHAT

Copy-paste ovo + transcript:

```
Koristi remotion-planner skill da napraviš animaciju od ovog transcripta. Pokreni ceo workflow: voiceover, timestamps, struktura, camera, sounds. Na kraju pokreni remotion-builder da napraviš projekat i pokreni server.

TRANSCRIPT:
[PASTE TRANSCRIPT HERE]
```
