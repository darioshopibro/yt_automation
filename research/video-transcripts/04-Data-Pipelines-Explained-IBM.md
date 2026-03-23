# Video: Data Pipelines Explained
Source: https://www.youtube.com/watch?v=6kEGUCrBEU0

## Segment 1: Water Pipeline Analogy
> "water starts out in our lakes our oceans and even our rivers but most of us probably wouldn't drink straight from the lake right we have to treat and transform this water into something that's safe for us to use and we do this using treatment facilities and we get the water from where it is to where it needs to go using water pipelines"

## Segment 2: Water to Multiple Destinations
[BRANCHING]
> "once that water has gotten from the source to their treatment plants it's then cleansed and made sure it's safe to use and then it's sent out using even more pipelines to where we need it and we use it in a couple different places we need it for drinking water we need it for cleaning and we also need it for agriculture"

## Segment 3: Data Sources
[BRANCHING]
> "data in organization starts out in data lakes it's in different databases that are a part of different sas applications some applications are on-prem and then we also have streaming data which is kind of like our river here now this can be data that is coming in in real time and so an example of that could be sensor data from factories where data's being collected every second and being sent back up to our repositories"

## Segment 4: ETL Process
> "one of the most common processes is etl which stands for extract transform and load and that does exactly what it sounds like it extracts data from where it is it transforms it by cleaning up mismatching data by taking care of missing values getting rid of duplicated data putting in making sure the right columns are there and then loading it into a landing repository ready-to-use business data an example of one of these repositories could be an enterprise data warehouse"

## Segment 5: Batch vs Stream Processing
[BRANCHING]
> "most of the time we use something called batch processing which means that on a given schedule we load data into our etl tool and then load it to where it needs to be but we could also have stream ingestion which would support the streaming data that i mentioned earlier so it's continuously taking data in transforming it and then continuously loading it to where it needs to be"

## Segment 6: Data Replication
> "another tool that we might see is data replication so what this involves is a continuously replicating and copying data into another repository before being loaded or used by our use case... one of the reasons could be that the application or use case where we need this data needs to have a really high performant back end to it and it's possible that our source data can't support something like that another reason could be for backup and disaster recovery reasons"

## Segment 7: Data Virtualization
> "what if we want to test out a new data use case and don't want to go through a large data transformation project well in that case we can use a technology called data virtualization to simply virtualize access to our data sources and only query them in real time when we need them without copying them over and once we're happy with the outcome of our test use case we can go back and build out these formal data pipelines"

## Segment 8: Pipeline Methods Overview
[BRANCHING]
> "when we talk about data pipelines we have a few different processes that we can use to help us handle the task of transforming and cleaning this data we can use processes like etl data replication we can also use something called data virtualization"

## Segment 9: Data Consumers
[BRANCHING]
> "after we've used all these different processes to get data ready for analysis or different applications we can start using it so what are the different ways in which we can use this data well we might need it for our business intelligence platforms that are needed for different types of reporting well we might also need it for machine learning use cases right so machine learning requires tons and tons of high quality data so we need to use these data pipeline tools to feed our machine learning algorithms"
