# How Big Tech Uses Git | Google, Meta, and Amazon Explained

**Channel:** ByteMonk
**URL:** https://www.youtube.com/watch?v=MVWzn5EIdIY
**Duration:** 6:26
**Views:** 47.5K views

---

## Full Transcript

You have probably used Git to push code to GitHub or collaborate on a project. But how do companies like Google, Meta, and Amazon use Git when thousands of engineers are committing to code bases measured in terabytes? In this video, we'll break down how big tech managers get at scale, their workflows, their custom tools, and why trunkbased development keeps showing up again and again. Let's jump in.

Previously we have covered the foundations. Let's zoom out and see how big tech companies manage their enormous code bases with Git and other version control systems at scale. Each of these companies has thousands of developers and massive code bases. Let's start with Google.

Now while most teams use G, Google doesn't, at least not in the traditional sense. Google is famous for keeping most of its code and single monolithic repository or monor repo. Their code base is just too massive. We are talking about billions of lines of code, tens of thousands of engineers and over 40,000 comets per day, half by humans, half by bots. To handle this, Google built its own version control system called Piper and a cloud-based workspace system called CITC clients in the cloud. It's not get, but the core ideas are familiar. Check out, change, submit.

What makes Google unique is how they work. They use one giant monor repo, and almost everyone commits to the same main branch, the trunk. Yes, Google strongly practices trunk based development. No longive branches, no endless rebases. Instead, features are hidden behind feature flags until they are ready to go live. And to keep this trunk stable, Google relies on an army of automation. Every change triggers automated tests. Peer review is required through an internal tool called critique. And the system can even refactor APIs across the entire codebase.

At Google, everything starts with trunk based development. Engineers don't work on long live branches. They integrate early and often into one main line, the trunk. Now, what if the feature isn't fully ready? Instead of holding it back, they use feature flex, allowing incomplete work to be merged and toggled off in production. Everything flows into the Piper Monor report, Google's internal version control system. Engineers may use shortlived branches, but the final destination is always the trunk. Developers work in isolated CITC workspaces sync to the latest trunk. This keeps everyone up to date even with thousands of comments flying in daily. And when a change is ready, it goes through critique, Google's internal code review tool. Once it gets the green light or LGTM, automation kicks in. This includes automated test, static analysis, and even automerge, rebase, or reject. If something breaks, bots can fix or block it, keeping the trunk always green. For big changes like an API refactor, tools can programmatically update their entire codebase. No waiting on 200 teams. The refactor just happens and once everything passes, the change list is submitted and the process repeats.

Meta like many others started with git. As the codebase creo into a monor repo, performance issues started showing up. Git wasn't built for repositories this massive. operation like get status or get commit began taking minutes and the problem was only getting worse. So they pivoted switching to mercurial a gitlike distributed version control system. Why mercurial? Because it was more flexible and open to performance optimization. Meta engineers poured in custom tooling helping Mercurial scale to handle terabytes of code and thousands of daily commits. And out of this came Sapling a custom front-end built by Meta. It works with both Git and Mercurial under the hood, offering a smoother, faster experience, especially for large repositories. It was designed for engineers working with stack divs, rebasing, and integrating quickly with trunk.

Meta's engineering culture leans heavily on trunkbased development, just like Google, but they take it further with stack diffs, small incremental comets layered on top of each other. Engineers frequently rebase and scratch their comets before landing them on main, keeping history clean. And if something breaks, no roll back drama. They fix forward, patching bugs on the trunk itself, and moving on.

In short, Meta ditched Git for performance, but kept the Git mindset, fast commits, small changes, one main line, and they have even open source some of that tooling like Sapling, so the rest of us can benefit too.

Unlike Google or Meta, Amazon doesn't have one giant codebase. Instead, it's all about decentralization. Think two pizza teams, small autonomous groups, each owing their own microser. That means thousands of git repos, not one monor repo. Each team manages their codebase, their pipelines, their releases, often using trunk based or prdriven workflows. This multi-reo setup avoids joint scaling issues, but introduces a new challenge, coordination across repos when services need to talk.

On the tooling side, Amazon has their own stack like AWS code commit for git hosting and code pipeline for CI/CD. A comet triggers test builds and deployments often going straight to prod after passing checks. So while get use varies by team, the common thread is move fast, keep your service deployable, and own your pace of the system. It's the opposite of Google's monor repo, but perfect for Amazon's service first culture. One fun fact, people sometimes joke Amazon has many little monor repos, one per team.

So that's how big tech users get. From Google's monor repo to meta stack divs to Amazon's micro repo agility. The tools may differ, but the goals are the same. Move fast, stay safe, and scale without chaos. And if you found this video helpful, share it with your team or drop a comment about the workflow your org uses. Until next time, happy committing.

---

## SECTION ANALYSIS FOR STICKY/CANVAS TEMPLATE

### [SECTION 1] HOOK - Scale Problem (0:00 - 0:30)
**Content:** "how do companies like Google, Meta, and Amazon use Git when thousands of engineers are committing to code bases measured in terabytes?"
**Template Fit:** Opening question that creates curiosity gap
**Visual:** Git logo surrounded by numbers: "1000s of engineers", "Terabytes of code", "40,000 commits/day"

---

### [SECTION 2] GOOGLE - Monorepo + Piper (0:30 - 2:30)
**Content:** "Google is famous for keeping most of its code and single monolithic repository... built its own version control system called Piper... trunk based development"
**Template Fit:** COMPANY CASE STUDY - first of three
**Visual:** Google architecture diagram:
```
[GOOGLE]
    ↓
[PIPER] ← Custom VCS (not Git!)
    ↓
[MONOREPO] ← Billions of lines
    ↓
[TRUNK] ← Everyone commits here
    ↓
[CITC Workspaces] ← Engineers work here
    ↓
[Critique] ← Code review
    ↓
[Automated Tests] → [LGTM] → [Merge]
```

[BRANCHING] - Deep dives:
- "What is trunk-based development?"
- "How feature flags work"
- "Piper vs Git comparison"

---

### [SECTION 3] META - Mercurial + Sapling (2:30 - 4:00)
**Content:** "Meta... started with git... performance issues... switched to mercurial... custom front-end built by Meta... Sapling... stack diffs"
**Template Fit:** COMPANY CASE STUDY - second of three
**Visual:** Meta architecture diagram:
```
[META]
    ↓
[SAPLING] ← Custom frontend (open source!)
    ↓
[MERCURIAL] ← Under the hood
    ↓
[MONOREPO] ← Terabytes of code
    ↓
[TRUNK] ← Main branch
    ↓
[Stack Diffs] ← Layered commits
    ↓
[Rebase + Squash] → [Land on main]
```

[BRANCHING] - Deep dives:
- "What are stack diffs?"
- "Mercurial vs Git"
- "Fix forward vs Rollback"

---

### [SECTION 4] AMAZON - Micro-repos (4:00 - 5:30)
**Content:** "Amazon doesn't have one giant codebase... two pizza teams... thousands of git repos, not one monor repo... AWS code commit... code pipeline"
**Template Fit:** COMPANY CASE STUDY - third of three (contrast to others)
**Visual:** Amazon architecture diagram:
```
[AMAZON]
    ↓
[TWO-PIZZA TEAMS] ← Small, autonomous
    ↓
[THOUSANDS OF REPOS] ← One per microservice
    ↓
[AWS CodeCommit] ← Git hosting
    ↓
[AWS CodePipeline] ← CI/CD
    ↓
[Direct to Prod] ← Fast deployment
```

[BRANCHING] - Deep dives:
- "Monorepo vs Multi-repo"
- "Two-pizza teams explained"
- "AWS CI/CD stack"

---

### [SECTION 5] COMPARISON + TAKEAWAYS (5:30 - 6:26)
**Content:** "From Google's monorepo to meta stack diffs to Amazon's micro repo agility. The tools may differ, but the goals are the same. Move fast, stay safe, and scale without chaos."
**Template Fit:** COMPARISON TABLE - summary visual
**Visual:**

| Company | VCS | Repo Style | Key Practice |
|---------|-----|------------|--------------|
| Google | Piper | Monorepo | Trunk-based + Feature flags |
| Meta | Mercurial/Sapling | Monorepo | Stack diffs + Fix forward |
| Amazon | Git | Multi-repo | Two-pizza teams + Fast deploy |

---

## KEY TAKEAWAYS FOR OUR STYLE

1. **Three-Company Framework:** Google vs Meta vs Amazon creates clear structure
2. **Custom Tools Named:** Piper, Critique, CITC, Sapling - adds credibility
3. **Common Thread:** Trunk-based development appears everywhere
4. **Contrast Pattern:** Monorepo (Google/Meta) vs Multi-repo (Amazon)
5. **Concrete Numbers:** "40,000 commits/day", "billions of lines"

---

## BRANCHING OPPORTUNITIES SUMMARY

| Timestamp | Topic | Branch Options |
|-----------|-------|----------------|
| 0:30 | Google deep dive | Piper, CITC, Critique, Feature flags |
| 2:30 | Meta deep dive | Sapling, Stack diffs, Mercurial |
| 4:00 | Amazon deep dive | CodeCommit, CodePipeline, Two-pizza teams |
| 5:30 | Concepts | Trunk-based dev, Monorepo vs Multi-repo |

---

## COMPARATIVE ARCHITECTURE DIAGRAM

```
                    VERSION CONTROL AT SCALE
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
    [GOOGLE]            [META]             [AMAZON]
        │                   │                   │
    [Piper]           [Sapling]            [Git]
    (Custom)          (Mercurial)         (Standard)
        │                   │                   │
    [MONOREPO]         [MONOREPO]         [MULTI-REPO]
    Billions LOC       Terabytes          1000s of repos
        │                   │                   │
    [TRUNK]            [TRUNK]            [TRUNK/PR]
        │                   │                   │
    [Feature           [Stack             [Team
     Flags]             Diffs]             Ownership]
        │                   │                   │
    [Critique]         [Fix Forward]      [CodePipeline]
```

---

## KEY VOCABULARY TO ANIMATE

- **Trunk-based development** - Everyone commits to main
- **Monorepo** - One giant repository for everything
- **Feature flags** - Hide incomplete features in prod
- **Stack diffs** - Layered, incremental commits
- **Fix forward** - Patch bugs on trunk, don't rollback
- **Two-pizza teams** - Teams small enough to feed with 2 pizzas
