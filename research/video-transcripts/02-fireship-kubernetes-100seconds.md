# Video: Kubernetes Explained in 100 Seconds
Source: https://www.youtube.com/watch?v=PziYflu8cB8

## Segment 1: Orchestra Analogy
> "kubernetes a tool for managing and automating containerized workloads in the cloud imagine you have an orchestra think of each individual musician as a docker container to create beautiful music we need a conductor to manage the musicians and set the tempo now imagine the conductor as kubernetes and the orchestra as an app like robinhood"

## Segment 2: Scaling Based on Workload
[BRANCHING]
> "when the markets are closed an app like robinhood isn't doing much but when they open it needs to fulfill millions of trades for overpriced stocks like tesla and shopify kubernetes is the tool that orchestrates the infrastructure to handle the changing workload it can scale containers across multiple machines and if one fails it knows how to replace it with a new one"

## Segment 3: Cluster Architecture
[BRANCHING]
> "a system deployed on kubernetes is known as a cluster the brain of the operation is known as the control plane it exposes an api server that can handle both internal and external requests to manage the cluster it also contains its own key value database called etcd used to store important information about running the cluster what it's managing is one or more worker machines called nodes"

## Segment 4: Node Components
[BRANCHING]
> "when you hear node think of a machine each node is running something called a cubelet which is a tiny application that runs on the machine to communicate back with the main control plane mother ship inside of each node we have multiple pods which is the smallest deployable unit in kubernetes when you hear pod think of a pot of whales or containers running together"

## Segment 5: Horizontal Scaling and High Availability
[BRANCHING]
> "as the workload increases kubernetes can automatically scale horizontally by adding more nodes to the cluster in the process it takes care of complicated things like networking secret management persistent storage and so on it's designed for high availability and one way it achieves that is by maintaining a replica set which is just a set of running pods or containers ready to go at any given time"

## Segment 6: YAML Configuration
> "as a developer you define objects in yaml that describe the desired state of your cluster for example we might have an nginx deployment that has a replica set with three pods in the spec field we can define exactly how it should behave like its containers volumes ports and so on you can then take this configuration and use it to provision and scale containers automatically and ensure that they're always up and running and healthy"
