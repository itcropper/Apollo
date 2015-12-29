var AWS = require('aws-sdk');

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIAJT3WCCDBZSDYQFHQ",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "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",
    region: 'us-west-2'
});

AWS.config.apiVersions = {
  elastictranscoder: '2012-09-25',
  // other service API versions
};  

var eltr = new AWS.ElasticTranscoder();
    

exports.createAndRunAWSJob = function(InputKey, path){
    
    console.log("InputKey: ", InputKey);
    var params = {
        PipelineId: '1432231958337-41l3et',
        Input: {
            AspectRatio: '1:1',
            Container: 'auto',
            FrameRate: 'auto',
            Interlaced: 'auto',
            Key: InputKey + '.MP4',
            Resolution: 'auto'
        },
        OutputKeyPrefix: 'Videos/',
        Outputs: [
            {
              Key: InputKey + '/HLS600k',
              PresetId: '1351620000001-200040',
              Rotate: 'auto',
              SegmentDuration: '3',
              ThumbnailPattern: InputKey + '/600k' + '{count}'
            },
            {
              Key: InputKey + '/HLS1M',
              PresetId: '1351620000001-200030',
              Rotate: 'auto',
              SegmentDuration: '3',
              ThumbnailPattern: InputKey + '/1M' + '{count}'
            }
        ]

    };
    
    eltr.createJob(params, function(err, data) {
        if (err) {
            console.log("failed at amazon", err, err.stack);
        } else {
            console.log("succeeded at amazon", data); 
        }
    });
};


//        ,
//        Playlists: [
//            {
//              Format: 'HLSv4',
//              Name: InputKey + '/HLS600k/index',
//              OutputKeys: [
//                'Videos/' + InputKey + '/HLS600k'
//              ]
//            },
//            {
//              Format: 'HLSv4',
//              Name: InputKey + '/HLS1M/index',
//              OutputKeys: [
//                'Videos/' + InputKey + '/HLS1M'
//              ]
//            }
//        ]

