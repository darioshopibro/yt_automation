# Video: RAG Explained For Beginners - KodeKloud
Source: https://www.youtube.com/watch?v=_HQ2H_0Ayy0

## Segment 1: The Problem Statement
[BRANCHING]
> "your company has 500 gigabytes of documents in their server and you're asked to connect an AI assistant just like chatpt to answer questions about these documents... you know that typical chat applications can't accept more than a dozen files. So, you have to use a different method to allow the AI to search, read, and understand the entire files"

## Segment 2: Failed Approach 1 - Search Everything
> "Maybe you think you can create a clever algorithm to search the title of the documents and its contents to rank them by relevance. But you soon realize that that means that every time the user searches, it would need to search the entire 500 GB of documents. And this is a very inefficient way to get it done."

## Segment 3: Failed Approach 2 - Pre-summarize
> "So maybe you try to do something else by doing some pre-processing work before so that preemptively you summarize all documents into searchable chunks. But you also realize in this case that it's not likely going to be an accurate way to get things done."

## Segment 4: The Solution - Vector Embeddings
> "is it possible that instead of searching through the entire 500 GB of documents, we essentially store these documents by preserving the semantics which means meaning of those words into a vector embedding and store those into a database as vectors"

## Segment 5: Chunking for Context Windows
[BRANCHING]
> "maybe we can retrieve these faster by splitting the context into chunks in the vector database so that AI assistant can fit them into their context window and generate output from it. This method is called rag or retrieval augmented generation."

## Segment 6: RAG Three-Step Breakdown
> "In order to understand how rag works, we need to break them down into three different steps. Retrieval, augmented, and generation."

## Segment 7: Retrieval Step - Query Embedding
> "Starting with retrieval, just like how we converted the documents into vector embeddings to store them into the database, we do the exact same step for the question... Once the word embedding for the question is generated, the embedding for the question is compared against the embedding of the documents."

## Segment 8: Semantic Search Definition
> "This type of search is called semantic search where instead of searching by static keywords to find relevant contents based on its matching the meaning and the context of the query is used to match against the existing document."

## Segment 9: Augmentation Step
> "Augmentation in rag refers to the process where the retrieved data is injected into the prompt at runtime... Typically AI assistants rely on what they learn during pre-training which is static knowledge that can become outdated really fast. Instead, our goal here is to have the AI assistant rely on up-to-date information in the vector database."

## Segment 10: Generation Step
> "The final step of rag is generation. This step is where AI assistant generates the response given the semantic relevant data retrieved from the vector database."

## Segment 11: RAG Configuration Strategies
[BRANCHING]
> "you have to employ different strategies like chunking strategy where you determine the size and overlap of each chunk. embedding strategy to decide which embedding model to use and to convert your documents into factor embeddings and retrieval strategy where you control the threshold of how similar the words need to be as well as additional filters that you might want to add in the data set."

## Segment 12: Different Data Types Require Different Strategies
[BRANCHING]
> "Setting up a rack system will look different from one system to another because it heavily depends on the data set that you're trying to store. For example, legal documents will require a different chunking strategy than say customer support transcript document. This is because legal documents often have long structured paragraph that needs to be preserved. While conversational transcript can be just fine with sentence level chunking with high overlap to preserve context."

## Segment 13: Practical Stack Components
> "I created a Python virtual environment, activated, install UV, and then pull in Chroma DB Sentence Transformers, OpenAI, and Flask... I spin up Chromma DB locally using a persistent client and create a collection named tech corpse_docs."

## Segment 14: Chunking Implementation
> "I write a small script that chunks text with a size 500 and overlap 100. This preserves context across boundaries and improve retrieval quality."

## Segment 15: Embedding Similarity
> "I load all mini LML L6V2 from sentence transformers, encode a few short sentences, and compute similarities... The big idea here is that questions and documents both become vectors. So we can measure meaning not just words. So dogs allowed and pets permitted have a high similarity."
