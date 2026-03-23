# Video: RAG Explained - IBM Technology
Source: https://www.youtube.com/watch?v=qppV3n3YlF8

## Segment 1: The Journalist-Librarian Analogy
> "so imagine you're a journalist and you want to write an article on a specific topic now you have a pretty good general idea about this topic but you'd like to do some more research so you go to your local library right now this library has thousands of books on multiple different topics but how do you know as the journalist which books are relevant for your topic well you go to the librarian now the librarian is the expert on what books contain which information in the library so our journalist queries the librarian to retrieve books on certain topics and the librarian produces those books and provides them back to the journalist"

## Segment 2: RAG Definition
> "love this sounds like a lot like the process of rag or retrieval augmented generation where large language models call on Vector databases to provide key sources of data and information to answer a question"

## Segment 3: User Prompt Flow
> "so we have a user in your scenario it's that journalist and they have a question so what types of questions would you want to ask right maybe we can make this more of a business context yeah so let's say this is a business analyst and let's say they want to ask um what was Revenue in q1 from customers in the Northeast region right so that's your prompt"

## Segment 4: Multiple Data Sources
[BRANCHING]
> "you'll need multiple different sources of data potentially to answer a specific question right whether that's maybe a PDF or another business application or maybe some some images whatever that question is we need the appropriate data in order to provide the answer back"

## Segment 5: Vector Database Explanation
> "we can take this data and we can put it into what we call a vector database a vector database is a mathematical representation of structured and unstructured data similar to what we might see in an array... and these arrays are better suited or easier to understand for machine learning or generative AI models versus just that underlying unstructured data"

## Segment 6: Embedding and Prompt Augmentation
> "we query our Vector database right and we get back an embedding that includes the the relevant data for which we're prompting and then we include it back into the original prompt right yeah exactly that feeds back into the prompt and then once we're at this point we move over to the other side of the equation which is the large language model"

## Segment 7: LLM Generation Output
> "that prompt that includes the vector embeddings now are fed into the large language model which then produces the output with the answer to our original question with sourced up-to-date and accurate data"

## Segment 8: Data Updates and Refresh
> "as new data comes into this Vector database or things that are updated back to your relevant question around performance in q1 as new data comes in those embeddings are updated so when that question's asked a second time we have more relevant data in order to provide back to the llm who then generates the output and the answer"

## Segment 9: Dual Governance Requirements
[BRANCHING]
> "data that comes in on this side but also on this side is incredibly important into the output that we get when we go to make that prompt and get that answer back so it really is true garbage in and garbage out right so we need to make sure we have good data that comes into the vector database we need to make sure that data is clean governed and managed properly"

## Segment 10: LLM Transparency Requirement
> "on the large language model side we need to make sure that we're not using a large language model that takes a blackbox approach right so a model where you don't actually know what is the underlying data that went into training it right you don't know if there's any intellectual property in there you don't know if there's inaccuracies in there or you don't know if there are pieces of data that will end up perpetuating bias in your output results"
