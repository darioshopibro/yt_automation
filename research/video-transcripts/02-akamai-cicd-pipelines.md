# Video: CI/CD Explained | How DevOps Use Pipelines for Automation
Source: https://www.youtube.com/watch?v=M4CXOocovZ4

## Segment 1: DevOps Infinity Loop
> "ci cd stands for continuous integration and continuous deployment but what does that mean well in devops which is short for development and i t operations it refers to the software development life cycle the steps are usually written out within an infinity loop since it's a cycle that repeats forever the steps in the cycle are developers write the code then it gets built or all compiled together then it's tested for bugs then it's deployed into production where it's used by end users or customers then we monitor and collect feedback and finally we plan improvements around that feedback rinse and repeat"

## Segment 2: Continuous Integration Flow
[BRANCHING]
> "continuous integration which is the ci is a development practice that requires developers to integrate code into a shared repository several times a day the code is verified by an automated build which allows teams or the project owner to detect any problems early on"

## Segment 3: Three Types of Automated Tests
[BRANCHING]
> "from there the code is analyzed and given a series of automated tests three examples are unit testing this tests the individual units of the source code validation testing this makes sure that the software satisfies or fits the intended use and you have format testing this checks for syntax and other formatting errors these tests are created as a workflow and then are run every time you push to the master branch"

## Segment 4: CI/CD Tools
[BRANCHING]
> "some popular cicd environments include jenkins which is an open source solution circle ci git lab github actions and then there's team city which is a proprietary solution"

## Segment 5: Technical Debt Timeline
[BRANCHING]
> "it also helps to prevent something that we call technical debt which is the idea that since main code repos are constantly being built upon over time then a shortcut fix taken on day one is now an exponentially more expensive fix years later because now that band-aid of a fix would be so deeply intertwined and baked into all the code bases and logic"

## Segment 6: Complete CI/CD Workflow Pipeline
[BRANCHING]
> "what's the ci cd workflow look like well let's say that you have a team of developers writing the code they use source code management like github or git lab next you have the build this is where the application gets compiled this runs the packages installations then you have the release pipeline this deploys the app for example to a web server now the fun part we need a ci cd system in place to make sure that our app doesn't have bugs or abnormalities so in the build pipeline i'll add a unit test in the release pipeline i'll add an integration test and maybe a ui test as well"

## Segment 7: Three Benefits
[BRANCHING]
> "what are some of the benefits of cicd three examples are shorter cycle times this is the speed at which a devops team can deliver a functional application from the moment work begins to when it is providing value to an end user it also leads to happier employees giving your engineers the tools to be successful makes everything better than having a manual solution and also it gets to market faster because code that has run through a pipeline and is now in production is making money whereas code sitting on a hard drive somewhere is not"
