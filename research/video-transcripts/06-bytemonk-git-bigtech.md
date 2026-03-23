# Video: How Big Tech Uses Git | Google, Meta, and Amazon Explained
Source: https://www.youtube.com/watch?v=MVWzn5EIdIY

## Segment 1: Scale Challenge
> "How do companies like Google, Meta, and Amazon use Git when thousands of engineers are committing to code bases measured in terabytes?"

## Segment 2: Google - Piper Monorepo
> "Google is famous for keeping most of its code and single monolithic repository or monor repo. Their code base is just too massive. We are talking about billions of lines of code, tens of thousands of engineers and over 40,000 comets per day, half by humans, half by bots. To handle this, Google built its own version control system called Piper and a cloud-based workspace system called CITC clients in the cloud. It's not get, but the core ideas are familiar. Check out, change, submit."

## Segment 3: Google - Trunk Based Development
> "They use one giant monor repo, and almost everyone commits to the same main branch, the trunk. Yes, Google strongly practices trunk based development. No longive branches, no endless rebases. Instead, features are hidden behind feature flags until they are ready to go live."

## Segment 4: Google - Workflow Pipeline
[BRANCHING]
> "At Google, everything starts with trunk based development. Engineers don't work on long live branches. They integrate early and often into one main line, the trunk. Now, what if the feature isn't fully ready? Instead of holding it back, they use feature flex, allowing incomplete work to be merged and toggled off in production. Everything flows into the Piper Monor report, Google's internal version control system."

## Segment 5: Google - Code Review and Automation
[BRANCHING]
> "And when a change is ready, it goes through critique, Google's internal code review tool. Once it gets the green light or LGTM, automation kicks in. This includes automated test, static analysis, and even automerge, rebase, or reject. If something breaks, bots can fix or block it, keeping the trunk always green."

## Segment 6: Meta - From Git to Mercurial
> "Meta like many others started with git. As the codebase creo into a monor repo, performance issues started showing up. Git wasn't built for repositories this massive. operation like get status or get commit began taking minutes and the problem was only getting worse. So they pivoted switching to mercurial a gitlike distributed version control system."

## Segment 7: Meta - Sapling and Stack Diffs
> "And out of this came Sapling a custom front-end built by Meta. It works with both Git and Mercurial under the hood, offering a smoother, faster experience, especially for large repositories. It was designed for engineers working with stack divs, rebasing, and integrating quickly with trunk."

## Segment 8: Meta - Fix Forward Philosophy
> "Meta's engineering culture leans heavily on trunkbased development, just like Google, but they take it further with stack diffs, small incremental comets layered on top of each other. Engineers frequently rebase and scratch their comets before landing them on main, keeping history clean. And if something breaks, no roll back drama. They fix forward, patching bugs on the trunk itself, and moving on."

## Segment 9: Amazon - Multi-Repo Microservices
[BRANCHING]
> "Unlike Google or Meta, Amazon doesn't have one giant codebase. Instead, it's all about decentralization. Think two pizza teams, small autonomous groups, each owing their own microser. That means thousands of git repos, not one monor repo. Each team manages their codebase, their pipelines, their releases, often using trunk based or prdriven workflows."

## Segment 10: Amazon - AWS CI/CD Pipeline
[BRANCHING]
> "On the tooling side, Amazon has their own stack like AWS code commit for git hosting and code pipeline for CI/CD. A comet triggers test builds and deployments often going straight to prod after passing checks. So while get use varies by team, the common thread is move fast, keep your service deployable, and own your pace of the system."

## Segment 11: Three Approaches Compared
[BRANCHING]
> "From Google's monor repo to meta stack divs to Amazon's micro repo agility. The tools may differ, but the goals are the same. Move fast, stay safe, and scale without chaos."
