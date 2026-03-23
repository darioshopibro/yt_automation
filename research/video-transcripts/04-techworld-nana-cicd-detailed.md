# Video: CI/CD Explained: The DevOps Skill That Makes You 10x More Valuable
Source: https://www.youtube.com/watch?v=AknbizcLq4w

## Segment 1: Manual Deployment Nightmare
> "Imagine you and your team are developing an application. The first version is done. So now it's time to deploy the app on a server. You check in your code and try to merge it into the main branch. You get merge conflicts because other engineers in your team also made some code changes before you. So you fix those issues manually. You try to merge again. Now a simple Jenkins job runs tests on the main and discovers a bunch of issues. Well, now we rush to fix them because we just broke the main branch."

## Segment 2: Code Freeze and Manual Testing
[BRANCHING]
> "So we fixed those issues and after all these fixes and code changes from different developers all in the main branch and now it's end of sprint. So we want to deploy all our changes because we need to release them at some point, right? So we do a code freeze which means no one's allowed to merge anything to main until we deploy the current state with all those changes."

## Segment 3: Manual Deploy Process
> "Once all the issues are resolved and the main branch is tested to the best of our ability, it's a deploy time. So we'll take a deep breath to prepare mentally. Someone on the team checks out the main branch locally. They bump the release version maybe and push that to git. And let's say we have a simple Jenkins build that we scrambled together that runs some tests, builds a Docker image and pushes to the Docker repository. Oh, the build is over. Now let's manually modify a Docker compose file or Kubernetes manifest file."

## Segment 4: Continuous Integration Definition
[BRANCHING]
> "Well, wouldn't it be more efficient if we ran those tests in the feature branch itself before trying to merge it? Like, why are we waiting for it to be merged to test if it breaks anything? Plus, if we have multiple branches, let's test each one individually before we merge them back into the main. Because when three different features are merged at the same time with large code changes, we won't even know which combination pieces had issues."

## Segment 5: CI Small Commits Philosophy
> "Why are we waiting right before merge to run those tests? Let's run them on every commit to the branch so it's easy to isolate the issue. Some developers program the entire thing locally first for like days and then push the whole implementation at once to the remote. So instead we encourage our developers to commit and push to remote more often so their smaller changes are tested more frequently and if there are any issues they can fix those before making even more changes. So we are committing smaller code changes more frequently and we test them right away and that my fellow engineers is called continuous integration CI."

## Segment 6: Build Automation Pipeline
[BRANCHING]
> "If all these extensive tests were successful, if they're all green, no issues were found after being merged into the main branch, build the app into a Docker image, give it the next version tag, push it to the Docker registry. So now we have a new artifact that is deployable. Then connect to the server or cluster whatever our dev environment is and run that newly built docker image container there. Or if we created a new deployment or service components for Kubernetes cluster or we made configuration changes to the application apply those changes on the dev environment directly from the build automation tool."

## Segment 7: End-to-End Testing in Pipeline
[BRANCHING]
> "So right after deploying to dev pipeline checks the new version of the application is up and running. We also want to run tests to see are we introducing any security issues that will affect our systems or make it easier for hackers to attack like do dynamic application testing by basically running the tests that try to hack into our systems maybe with SQL injection scripts and so on."

## Segment 8: Multi-Environment Pipeline Flow
> "Once those tests are green, we validated that the developers didn't mess up anything in the code changes. So now we can go to the next stage which is sometimes called test or staging environment. So we are releasing the code changes in stages where it gets tested at every stage and that workflow of deploying a release all the way to the staging or testing environment is called continuous delivery or CD and that's how we get CI/CD continuous integration continuous delivery CICD."

## Segment 9: Manual Approval Gate
[BRANCHING]
> "Very often we don't want to automatically deploy into prod. Sometimes staging may be used by the team or PM or product owner to demo the new features first to maybe higher level decision makers in the company to get input and make any adjustments if needed or someone needs to make the final approval before going live. So it's very common to have a manual confirmation right before deploying to prod. However, this is just a button just one click. So the deployment logic is still in the CI/CD pipeline tool itself."

## Segment 10: Canary Deployment Strategy
[BRANCHING]
> "Canary deployment the idea is super simple. We roll out the new feature to 1% of users or 5% and we observe for an hour and see if nothing blows up. Okay, that's great. Let's crank it up to 10%. Let's observe for two more hours. Okay, let's do 20%, let's see overnight, nothing crazy happens. Now we're good. Let's switch to 100%. So basically, canary deployment is a progressive roll out of an application that splits the traffic between an already deployed version and a new version that we just deployed."

## Segment 11: Blue-Green Deployment
[BRANCHING]
> "Alternatively, we also have green blue deployment. Again, super simple idea. You create two separate but identical environments. One environment call it blue is running the current application version and one we call it green is running the new application version. And the main idea is that if the new deployment has any issues, we can immediately switch the entire traffic back to the older version. So the main idea is that if something goes wrong, you can easily fall back to the previous version or environment."
