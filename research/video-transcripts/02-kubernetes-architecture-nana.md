# Video: Kubernetes Architecture Explained | Kubernetes Tutorial 15
Source: https://www.youtube.com/watch?v=umXEmn3cMWY

## Segment 1: Worker Node Three Processes
[BRANCHING]
> "one of the main components of kubernetes architecture are its worker servers or nodes and each node will have multiple application pots with containers running on that node and the way communities does it is using three processes that must be installed on every node that are used to schedule and manage those pots so nodes are the cluster servers that actually do the work that's why sometimes also called worker nodes so the first process that needs to run on every node is the container runtime in my example I have docker but it could be some other technology as well"

## Segment 2: Kubelet Process
> "the process that actually schedules those pots and the containers then underneath is cubelet which is a process of kubernetes itself unlike container runtime that has interface with both container runtime and the machine the node itself because at the end of the day cubelet is responsible for taking that configuration and actually running a pod or starting a pod with a container inside and then assigning resources from that node to the container like CPU RAM and storage resources"

## Segment 3: Multi-Node Communication with Services
[BRANCHING]
> "usually kubernetes cluster is made up of multiple nodes which also must have container runtime and cubelet services installed and you can have hundreds of those worker nodes which will run other pots and containers and replicas of the existing pots like my app and database pots in this example and the way that communication between them works is using services which is sort of a load balancer that basically catches the requests directed to the pot or the application like database for example and then forwards it to the respective pot"

## Segment 4: Kube-Proxy Intelligent Forwarding
[BRANCHING]
> "the third process that is responsible for forwarding requests from services to pots is actually cute proxy that also must be installed on every node and queue proxy has actually intelligent forwarding logic inside that makes sure that the communication also works in a performant way with low overhead for example if an application my app replica is making a request database instead of service just randomly forwarding the request to any replica it will actually forward it to the replica that is running on the same node as the pot that initiated the request thus this way avoiding the network overhead of sending the request to another machine"

## Segment 5: Master Node Four Processes
[BRANCHING]
> "all these managing processes are done by master nodes so master servers or master notes have completely different processes running inside and these are four processes that run on every master node that control the cluster state and the worker nodes as well so the first service is API server so when you as a user want to deploy a new application in a kubernetes cluster you interact with the API server using some client it could be a UI like kubernetes dashboard could be command line tool like cubelet or acuminate this API"

## Segment 6: API Server as Gateway
[BRANCHING]
> "API server is like a cluster gateway which gets the initial requests of any updates into the cluster or even the queries from the cluster and it also acts as a gatekeeper for authentication to make sure that only authenticated and authorized requests get through to the cluster that means whenever you want to schedule new pods deploy new applications create new service or any other components you have to talk to the API server on the master node and the API server then validate your request and if everything is fine then it will forward your request to other processes in order to schedule the pod or create this component that you requested"

## Segment 7: Scheduler Process
[BRANCHING]
> "if you send an API server a request to schedule a new pod API server after it's validates your request will actually hand it over to the scheduler in order to start the application pod on one of the worker nodes and of course instead of just randomly assigning to any node schedule has this whole intelligent way of deciding on which specific worker node the next pod will be scheduled or next component will be scheduled so first it will look at your request and see how much resources the application that you want to schedule will need how much CPU how much RAM and then it's gonna look at and it's going to go through the worker notes and see the available resources on each one of them and if it sees that one note is the least busy or has the most resources available it will schedule the new pod on that note"

## Segment 8: Controller Manager Detection and Recovery
[BRANCHING]
> "the next component is controller manager which is another crucial component because what happens when pods die on any note there must be a way to detect that notes died and then reschedule those pods as soon as possible so what controller manager does is detect state changes like crashing of pods for example so when pods die controller manager detects that and tries to recover the cluster state as soon as possible and for that it makes a request to the scheduler to reschedule those dead parts in the same cycle happens here where the scheduler decides based on the resource calculation which worker notes should restart those pots again and makes requests so the corresponding cubelets on those worker notes to actually restart the pods"

## Segment 9: etcd Cluster Brain
> "the last master process is set CD which is a key value store of a cluster state you can think of it as a cluster brain actually which means that every change in the cluster for example when a new pod gets scheduled when a pod dies all of these changes get saved or updated into this key value store of Ed CD and the reason why at CD store is a cluster brain is because all of these mechanism with scheduler controller manager etc works because of its data"
