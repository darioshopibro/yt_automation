# Video: DevOps In 5 Minutes | What Is DevOps?
Source: https://www.youtube.com/watch?v=Xrgk023l4lI

## Segment 1: Traditional Dev vs Ops Problem
[BRANCHING]
> "Right from the start, software development comprise two different departments. The development team that develops the plan, designs and builds the system from scratch and the operation team for testing and implementation of whatever is developed. The operations team gave the development team feedback on any bugs that needed fixing and any rework required. Invariably, the development team would be idle awaiting feedback from the operations team."

## Segment 2: The Wall of Confusion
> "This undoubtedly extended timelines and delayed the entire software development cycle. There would be instances where the development team moves on to the next project while the operations team continues to provide feedback for the previous code. This meant weeks or even months for the project to be closed and final code to be developed."

## Segment 3: DevOps Solution
> "Now what if the two departments came together and worked in collaboration with each other? What if the wall of confusion was broken? And this is called the DevOps approach. The DevOps symbol resembles an infinity sign suggesting that it is a continuous process of improving efficiency and constant activity."

## Segment 4: DevOps Phases Pipeline
[BRANCHING]
> "The first phase is the planning phase where the development team puts down a plan keeping in mind the application objectives that are to be delivered to the customer. Once the plan is made, the coding begins. The development team works on the same code and different versions of the code are stored into a repository with the help of tools like git and merged when required. This process is called version control. The code is then made executable with tools like Maven and Gradel in the build stage. After the code is successfully built, it is then tested for any bugs or errors. The most popular tool for automation testing is Selenium."

## Segment 5: Deployment and Monitoring
> "Once the code has passed several manual and automated tests, we can say that it is ready for deployment and is sent to the operations team. The operations team now deploys the code to the working environment. The most prominent tools used to automate these phases are Anible, Docker and Kubernetes. After the deployment, the product is continuously monitored and Nagios is one of the top tools used to automate this phase."

## Segment 6: Jenkins Continuous Integration
[BRANCHING]
> "The feedback received after this phase is sent back to the planning phase and this is what forms the core of the DevOps life cycle that is the integration phase. Jenkins is the tool that sends the code for building and testing. If the code passes the test, it is sent for deployment and this is referred to as continuous integration."

## Segment 7: Netflix Chaos Engineering
[BRANCHING]
> "Netflix introduced its online streaming service in 2007. In 2014, it was estimated that a downtime for about an hour would cost Netflix $200,000. However, now Netflix can cope with such issues. They opted for DevOps in the most fantastic way. Netflix developed a tool called the Simeon Army that continuously created bugs in the environment without affecting the users. This chaos motivated the developers to build a system that does not fall apart when any such thing happens."
