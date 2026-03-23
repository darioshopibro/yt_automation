# CI/CD DevOps Video Research Summary

**Research Date:** 2026-03-23
**Query:** "CI CD pipeline devops workflow explained"
**Focus:** Videos with BRANCHING patterns for sticky/canvas template

---

## Videos Analyzed

| # | Video | Channel | Duration | Views | Branching Score |
|---|-------|---------|----------|-------|-----------------|
| 1 | [DevOps CI/CD Explained in 100 Seconds](https://www.youtube.com/watch?v=scEDHsr3APg) | Fireship | 1:56 | 1.7M | 9/10 |
| 2 | [CI/CD Explained - Pipelines for Automation](https://www.youtube.com/watch?v=M4CXOocovZ4) | Akamai Developer | 6:40 | 338.5K | 9/10 |
| 3 | [DevOps In 5 Minutes](https://www.youtube.com/watch?v=Xrgk023l4lI) | Simplilearn | 4:40 | 2.2M | 8/10 |
| 4 | [CI/CD Explained: 10x More Valuable](https://www.youtube.com/watch?v=AknbizcLq4w) | TechWorld with Nana | 21:07 | 418K | **10/10** |
| 5 | [GitHub Actions Tutorial](https://www.youtube.com/watch?v=YLtlz88zrLg) | Tom Shaw | 6:12 | 269.4K | 9/10 |

---

## Best Videos for Branching Visualization

### #1 RECOMMENDED: TechWorld with Nana (21:07)
**Why:** Most comprehensive coverage of branching scenarios:
- Test pass/fail at feature branch level
- Build pipeline success/failure
- Multi-environment progression (Dev -> Staging -> Prod)
- Canary deployment (1% -> 10% -> 20% -> 100% with rollback)
- Blue-Green deployment (parallel environments with instant switch)
- Manual approval gates

### #2 RECOMMENDED: Tom Shaw GitHub Actions (6:12)
**Why:** Shows actual YAML workflow structure:
- Direct mapping from YAML to visual boxes
- Two distinct workflows (Test + Deploy)
- Clear step-by-step with dependencies
- Practical implementation focus

### #3 RECOMMENDED: Fireship (1:56)
**Why:** Concise with clear concepts:
- Perfect for short-form content
- Simple pipeline visualization
- Explicit success/failure paths
- Merge conflict scenario

---

## Common Branching Patterns Found

### Pattern 1: Test Pass/Fail
```
[Run Tests]
    |
   / \
  /   \
PASS  FAIL
 |      |
 v      v
Deploy  Alert
```

### Pattern 2: Multi-Environment Pipeline
```
[Code] -> [Dev] -> [Staging] -> [Prod]
              |          |          |
           Tests      Tests    Approval
              |          |          |
           Pass/Fail  Pass/Fail  Yes/No
```

### Pattern 3: Canary Deployment
```
[New Version]
     |
     v
[1% Users] --OK--> [10% Users] --OK--> [100% Users]
     |                   |
   FAIL               FAIL
     |                   |
     v                   v
  Rollback           Rollback
```

### Pattern 4: Blue-Green
```
[Blue: v1.0 (LIVE)]    [Green: v2.0 (TESTING)]
         |                       |
         |<---Switch if OK-------|
         |                       |
         |----Stay if FAIL------>|
```

---

## Sticky/Canvas Template Opportunities

### Best Sections for Multiple Connected Boxes

1. **Pipeline Stages** (all videos)
   - Code -> Build -> Test -> Deploy
   - Each stage as a box, arrows between

2. **Test Types** (Akamai video)
   - Unit Tests, Integration Tests, E2E Tests
   - Parallel branches converging

3. **Environment Progression** (Nana video)
   - Dev -> Staging -> Prod with tests at each level

4. **Deployment Strategies** (Nana video)
   - Canary with percentage boxes
   - Blue-Green with two parallel environments

5. **GitHub Actions Workflow** (Tom Shaw video)
   - Trigger -> Job -> Steps (sequential boxes)
   - Maps directly from YAML structure

---

## Recommended Approach for Video Production

### Short Video (60-90 seconds)
Use: Fireship video as reference
- Simple pipeline: Code -> Test -> Build -> Deploy
- One branching point: Pass/Fail

### Medium Video (3-5 minutes)
Use: Akamai or Tom Shaw as reference
- Full pipeline with multiple test types
- Show actual workflow structure
- 2-3 branching points

### Long/Detailed Video (10+ minutes)
Use: TechWorld with Nana as reference
- Complete CI/CD journey
- Multi-environment progression
- Canary + Blue-Green deployment strategies
- Maximum branching visualization

---

## Files Created

1. `/Users/dario61/Desktop/YT automation/research/video-transcripts/01-fireship-cicd-100-seconds.md`
2. `/Users/dario61/Desktop/YT automation/research/video-transcripts/02-akamai-cicd-pipelines.md`
3. `/Users/dario61/Desktop/YT automation/research/video-transcripts/03-simplilearn-devops-5min.md`
4. `/Users/dario61/Desktop/YT automation/research/video-transcripts/04-techworld-nana-cicd-detailed.md`
5. `/Users/dario61/Desktop/YT automation/research/video-transcripts/05-tom-shaw-github-actions.md`

Each file contains:
- Full transcript
- Sections marked for sticky/canvas template
- [BRANCHING] annotations where conditional paths exist
- Template suitability score
