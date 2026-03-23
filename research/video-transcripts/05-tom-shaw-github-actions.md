# Video: CI/CD Tutorial using GitHub Actions - Automated Testing & Automated Deployments
Source: https://www.youtube.com/watch?v=YLtlz88zrLg

## Segment 1: Why Automate
> "Nine out of 10 people hate this developer the one that doesn't automate anything... cicd or continuous integration and continuous delivery is the practice of automating the manual tasks that us mortals usually have to do when we're deploying our code to production things like compiling our code or running tests or uploading our code to our Cloud infrastructure automating things not only helps to save a lot of time it also removes the possibility of human error causing your entire system to burn to the ground."

## Segment 2: GitHub Actions Workflow Result
[BRANCHING]
> "When it's running we can see the progress of each step in the gift of actions workflow so if the workflow fails during some tests we know that the code is broken and therefore we don't want to deploy it to our server if the workflow is successful we're going to see a big green check mark telling us that everything is working within our c-base."

## Segment 3: Workflow Triggers
[BRANCHING]
> "You can run workflows using a variety of triggers for example every time we push code to our main branch we might want to deploy it to our production server automatically so that we don't have to do it ourselves or every time we create a new pull request we might want to test the code to make sure that everything is working before we merge that code into our main branch."

## Segment 4: Test Workflow Steps
> "The first step is going to be adding our code to our virtual environments using the checkout action. Now I want you to have a think about the steps that you would take if you were testing your code manually firstly you want to make sure that all of your dependencies have been install for your project we can do this by running mpmi which is going to run a clean install once your dependencies have been stalled you can run your tests using whatever Library you're using in your project."

## Segment 5: Pull Request Validation
[BRANCHING]
> "As you can see the GI of actions workflow is going to spin up a virtual environment run our test and then confirm that our code is working as expected so automatically I know the code is working without having to pull the pull request onto my local machine and then running the test manually."

## Segment 6: Manual Deployment Pain
> "If we weren't automating anything your deployment process may look a little like this first I'm going to run get pull to get the latest version of my code from my repository then I'm going to run get checkout to make sure that I'm in my main branch run mpm install mpm run build and then deploy my code to the server using this long command which I might get wrong oh and then SSH into the server to install the dependencies and restart the nodejs process okay as you can see this took a long time and it was pretty complicated for such a small project."

## Segment 7: Deploy Workflow Steps
> "Inside of this workflow we're going to run a job which is going to build our project and then deploy it to our server like we did with our testing workflow we're going to run our job on auntu check out the code and install nodejs we're going to run mpm C to do a clean install of the project dependencies and then run the build script once the build is completed we're going to deploy our code using SCP which is going to upload all of our files to the server."

## Segment 8: GitHub Secrets for SSH
> "Because access to our server is protected using SSH Keys we need to take an SSH key that has access to our server and add the content of it to our GitHub action Secrets this is where you can store sensitive credentials that need to be used within your GitHub actions but can't be stored within your repository for security reasons for example your stripe or open AI Keys you wouldn't want to put them in your repository."

## Segment 9: Full CI/CD Flow
[BRANCHING]
> "The final step in our deployment process is to SSH into the server install the dependencies and then restart the nodejs process in this case I'm using pm2 to manage the nodejs process... now if we merge that super cool feature that we were testing earlier you can see that we've triggered this automated workflow which is going to deploy our code to our production server."
