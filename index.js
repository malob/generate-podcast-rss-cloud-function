const Storage = require('@google-cloud/storage');
const Podcast = require('podcast');
const async = require('async');

// Global constants
const gcpProjectId = undefined;
const gcpBucketName = undefined;
const rssFileName = 'podcast.xml'

exports.generatePodcastRss = (event, callback) => {
  if (event.data.name == rssFileName) {
    callback(null, 'False alarm, it was just the RSS feed being updated.');
  } else {
    const feed = new Podcast({
      title: 'Malo’s Text-To-Speech Podcast',
      description: 'Malo’s personal podcast of cool articles.',
      feed_url: 'http://storage.googleapis.com/' + gcpBucketName + '/' + rssFileName,
      site_url: 'https://malob.me',
      author: 'Malo Bourgon',
      language: 'en',
      itunesType: 'episodic'
    });

    const storage = new Storage({ projectId: gcpProjectId });

    storage
      .bucket(gcpBucketName)
      .getFiles(null, (err, files) => {
        if (err) { callback('Could not get file list from GCS\n' + err); }
        else {
          async.map(files, (file, cb) => { file.getMetadata(null, cb) }, (err, filesMetadata) => {
            if (err) { callback('Failed to retrive metadata for files\n' + err); }
            else {
              async.filter(filesMetadata, metadataFilter, (err, filteredFilesMetadata) => {
                if (err) { callback('Failed trying to filter for only mp3 files\n' + err); }
                else {
                  async.map(filteredFilesMetadata, metadataToRssItem, (err, rssItems) => {
                    if (err) { callback('Failed to format RSS item from metadata\n' + err); }
                    else {
                      rssItems.forEach((item) => { feed.addItem(item) });
                      storage
                        .bucket(gcpBucketName)
                        .file(rssFileName)
                        .save(feed.buildXml('  '), { public: true, contentType: 'application/rss+xml' }, (err) => {
                          if (err) { callback('Failed to write RSS file to GCS\n' + err); }
                          else { callback(null, 'Podcast RSS regenerated.'); }
                        });
                    }
                  });
                }
              });
            }
          });
        }
      });
  }
};

function metadataFilter(metadata, cb) {
  cb(null, metadata.contentType == 'audio/mpeg');
}

function metadataToRssItem(metadata, cb) {
  rssItem = {
    title: metadata.metadata.title,
    description: 'Excerpt: ' + metadata.metadata.excerpt,
    url: metadata.metadata.url,
    author: metadata.metadata.author,
    enclosure: {
      url: 'http://storage.googleapis.com/' + metadata.bucket + '/' + metadata.name,
      size: metadata.size
    },
    date: metadata.timeCreated,
    itunesImage: metadata.metadata.leadImageUrl
  };

  cb(null, rssItem);
}