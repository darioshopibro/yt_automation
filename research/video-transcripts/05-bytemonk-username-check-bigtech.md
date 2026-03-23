# Video: How Big Tech Checks Your Username in Milliseconds
Source: https://www.youtube.com/watch?v=_l5Q5kKHtR8

## Segment 1: The Problem at Scale
> "When you are signing up for a new app, you enter your preferred username and get a message saying, 'This username is already taken.' It feels like a small inconvenience, but behind the scenes, that simple check is surprisingly complex. When you're dealing with billions of users, checking whether a username exist can't rely on a basic database query. That would create serious performance issues, high latency, bottlenecks, and unnecessary load in the system."

## Segment 2: Redis Hashmap - Exact Match
> "In radius, a hashmap lets you store multiple field value pairs under one key. For username lookups, each field can represent a username and its value could be something lightweight like a user ID or even a placeholder flag. When a user checks if a username is available, the system queries this hashmap. If the field exists, that is if the username is already in the map, that's a cache hit and radius returns a result instantly. It's a fast in-memory check that avoids touching the database for the vast majority of lookups."

## Segment 3: Tries - Prefix Trees
[BRANCHING]
> "A try is a treel like structure that organizes strings by their shared prefixes. So instead of storing each username as a whole, it breaks them down character by character and builds a path through the tree. This allows us to perform lookups in O of M time where M is the length of the string no matter how many total usernames we have. And that's not all. Tries naturally support prefix based queries and autocomplete, which makes them ideal for suggesting usernames when a user's first choice is already taken."

## Segment 4: B+ Trees - Database Index
> "B+ tree and their close cousin B trees are widely used in relational databases to index fields like usernames. These structures keep keys sorted and allow efficient lookups in o of login time. So even with the billion usernames, finding one might take around only 30 steps. Thanks to their high fan out, meaning each node can store hundreds of keys, the tree stays shallow. In real world scenarios, you can often search millions of entries with just three to four disk or memory reads."

## Segment 5: Bloom Filters - Memory Efficient Check
[BRANCHING]
> "A bloom filter is just a bit array combined with handful of hash functions. When you add a username, it's hashed multiple times and each hash sets a corresponding bit in the array. To check a username, you hash it the same way. And if any of those bits is zero, the username is definitely not in the set. If all the bits are one, then it's probably present. And that's when you fall back to a more expensive check like a database query."

## Segment 6: Bloom Filter Stats
> "What makes Bloom filters so powerful is that they never give false negatives. If they say the username isn't present, you can trust that. The only trade-off is that possibility of false positives, but that's usually acceptable when the alternative is scoring a massive database. And the space savings are significant. To store 1 billion usernames with a 1% false positive rate, you would need roughly around 1.2 GB of memory."

## Segment 7: Layered Architecture
[BRANCHING]
> "In real world large scale systems it's rarely about picking just one. Instead, companies like Google, Facebook, and Amazon combine these data structures strategically, layering them to maximize speed, reducing memory usage, and minimizing database load."

## Segment 8: Request Flow Through Layers
[BRANCHING]
> "Imagine you are checking if username bite monk is available. First, a load balancer routes the request. Now, in large distributed systems, load balancing typically happens at two levels. global and local."
