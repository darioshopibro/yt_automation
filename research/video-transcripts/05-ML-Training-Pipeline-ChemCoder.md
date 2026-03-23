# Video: How to Train AI ML Models - Full Pipeline
Source: https://www.youtube.com/watch?v=rysdr4khB5k

## Segment 1: Pipeline Overview
> "To build production level ml models you need to follow a well-designed workflow think of this workflow as steps that you need to follow in order to make sure that your model performs to the best extent possible building ml models is not as simple as calling model.fit on psyit learn package if you do one thing incorrectly your entire pipeline can be compromised."

## Segment 2: Data Cleaning - Three Problems
[BRANCHING]
> "The first step is the most important step and that involves cleaning the data... what I mean by cleaning data sets is removing Nan values that may be in the data set removing corrupted data and removing duplicates. If you have Nan values in your data set your model will most likely throw up an error even before it starts training because models cannot be trained on Nan values. But if you have duplicates they are one of the most dangerous types of data that you can have and the reason is it creates a bias for your model."

## Segment 3: Data Transformation by Type
[BRANCHING]
> "You need a way to transform your data and sometimes depending on your data set said you have to think what is the best way to represent data. If you've got images you probably have to get them into a sequence of numbers or an array. If you've got audio again same thing the computer only accepts numbers in the form of arrays or a sequence or a matrix whatever."

## Segment 4: Dimensionality Reduction Decision
[BRANCHING]
> "If you've got thousands of features is it best to feed the model all of those features or can you reduce it down to a lower Dimension using something like PCA to get it down to a few principal components which you can then feat it into your model."

## Segment 5: LLM Encoder-Decoder Pipeline
> "This is a very important concept especially if you're trying to learn something like llms large language models you have to actually find a way to encode your data and then decode your data. So in large language models basically words and letters are taken into an encoder which then encodes each word or letter into a number which is then used to train the model and then whatever the model spits out is again decoded using a decoder."

## Segment 6: Data Pre-Processing Options
[BRANCHING]
> "This important step is almost always used by every machine learning engineer and that is data pre-processing. What you basically do is you either scale your data or you standardize your data apply normalization and also look at a combination of these to make sure that your data set and when I say data set I actually mean the features don't have too much variability."

## Segment 7: Variance Problem Example
> "For example in house price prediction data set the house will have features like square feet and bathrooms bathroom it may have one bathroom whereas in terms of square feet it could be hundreds of square feet. So what happens there is for example across the data set the number of bathrooms might change by one or two whereas the square feed will change by hundreds so the variance between different features is much larger and what that does is it becomes harder and harder for the model to actually converge."

## Segment 8: Train-Test Split
[BRANCHING]
> "Now you've processed your data and it's time to train machine learning models on it and the first thing you will do is split the data into train and the test set and you can either do this as 80% train and 20% test or 70 30 split whatever it is."

## Segment 9: Class Imbalance Stratified Split
[BRANCHING]
> "Let's say we have three classes a b and c and let's say we've got 300 data points belonging to class A and about 600 points belong to class B and only another 100 points belonging to class C so Class C is severely underrepresented. In that case you would have to do stratified split such that your model includes a proper proportion of each class in your training data set."
