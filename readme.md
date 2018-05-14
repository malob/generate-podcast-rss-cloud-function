# Generate Podcast feed Cloud Function

This is a [Google Cloud Function](https://cloud.google.com/functions/) I hacked together to work with a Cloud Storage bucket, containing MP3 files and a Podcast RSS feed. In brief, whenever a new file is added to the bucket, this Cloud Function is triggered, and (re)generates a Podcast RSS feed for the MP3s in the bucket.

I created it as part of a project to generate a personal podcast of articles I want to consume. To get the full thing working see my [other repository](https://github.com/malob/article-to-audio-cloud-function) for a Cloud Function that, given a url, generates an audio file of an article using Google's [Cloud Text-To-Speech](https://cloud.google.com/text-to-speech/) API, puts it in a Cloud Storage bucket, and attaches some metadata about the article to the object in the bucket.

## Configuration details

To get this working you'll first need to setup the other Cloud Function mentioned above.

You'll then need to create a new Cloud Function (see configuration details below), and replace the undefined global constants in the code, gcpProjectID, and gcpBucketName, with the appropriate values. You'll also want to customize the RSS feed metadata in the `feed` constant.

### Cloud Function configuration
  * Memory allocation: 256 MB
  * Trigger: Cloud Storage bucket
  * Event Type: Finalize/Create
  * Bucket: [ID of a Cloud Storage bucket]