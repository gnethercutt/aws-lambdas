
var aws = require('aws-sdk');
var s3 = new aws.S3({ apiVersion: '2006-03-01' });
var nToKeep = 3; // number of old versions to keep around, plus current

exports.handler = function(event, context) {
    var bucket = event.Records[0].s3.bucket.name;
    var key = event.Records[0].s3.object.key;
    var params = {
        Bucket: bucket,
        Prefix: key
    };
    s3.listObjectVersions(params, function(err, data) {
        if (err) {
            console.log(err, err.stack);
            context.fail(err);
        } else { 
            var dparams = { 
                Bucket: bucket, 
                Delete: {
                    Objects: [ ]
                }
            };
            data.Versions.forEach( function(element, index, array, acc) {
                    if (index > nToKeep) dparams.Delete.Objects.push( { Key: key, VersionId: element.VersionId } );
                }, dparams);
            s3.deleteObjects(dparams, function(err, data) {
                if (err) {
                    console.log(err, err.stack); 
                    context.fail(err);
                } else {
                    context.succeed(bucket + "/" + key);
                }
            });
        }
    });
};
