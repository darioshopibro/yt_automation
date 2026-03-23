# Video: DevOps CI/CD Explained in 100 Seconds
Source: https://www.youtube.com/watch?v=scEDHsr3APg

## Segment 1: DevOps Definition
> "DevOps a set of practices to build test and release your code in small frequent steps"

## Segment 2: Continuous Integration Flow
> "one of the core practices of DevOps is continuous integration which has developers commit their code to a shared repository often on a daily basis each commit triggers an automated workflow on a CI server that can notify developers of any issues integrating their changes"

## Segment 3: Merge Hell Problem
[BRANCHING]
> "imagine Mary you're back and developer builds a new API for your product shortly after Jane your front-end developer starts work on a new UI a few months later when it comes time to merge their features we find that they're completely incompatible the build fails and we now have to spend a bunch of time and money resolving these conflicts"

## Segment 4: GitHub Actions Pipeline Steps
> "here on github I have a node.js web app in order to deliver this out to my customers I need to run three commands test build and deploy I can automate this entire process in the cloud by using a CI service like github actions first I create a workflow and then I tell it to run on every push to the master branch"

## Segment 5: Container Job Execution
> "the event triggers a job that runs on a Linux container in the cloud and we tell the container what to do as a series of steps first it checks out the code in this github repo then sets up nodejs installs my dependencies and runs my tests build and deploy commands"

## Segment 6: Pipeline Success/Failure Branching
[BRANCHING]
> "now anytime we commit code to the master branch in this repo it will run this workflow if any of the steps fail the bad software won't be delivered to our customers and will automatically know there's an issue that needs to be addressed"

## Segment 7: Two Main Benefits
[BRANCHING]
> "at the end of the day CI CD offers two main benefits it helps you automate things that would otherwise have to be done manually by developers that will increase your velocity but it also detects small problems early before they can grow into major disasters and that results in higher code quality"
