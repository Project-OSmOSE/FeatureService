
// fs stands for FeatureService



/******************************************************************************
                        fixtures utils functions
*****************************************************************************/

var makeErrorFixture = function(describe, FSEndpoint) {
  return {
      describe: describe,
      FSEndpoint: FSEndpoint,
      expectedFSResult: {
          status: 400
      }
  };
}

var fakeTimeserie = function(from,steps,stepDuration) {
    var fromDate = new Date(from);
    return { items: [...Array(steps).keys()].map(idx => {
            return {
                timestamp: (new Date(fromDate.getTime() +
                    (idx * stepDuration * 1000))).toISOString(),
                val: Math.random()
            };
        })
    }
}

var makeid = function () {
    var id = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 16; i++)
        id += possible.charAt(Math.floor(Math.random() * possible.length));

    return id;
}

var fakeTimeserieTob = function(from,steps,stepDuration) {
    var fromDate = new Date(from);
    return { items: [...Array(steps).keys()].map(idx => {
            return {
                timestamp: (new Date(fromDate.getTime() +
                    (idx * stepDuration * 1000))).toISOString(),
                val: [...Array(50)].map( elem => Math.random())
            };
        })
    }
}

var fakeEsResponse = function(timeSerie,esIndex) {
    var esRes = {
        "took" : 5,
        "timed_out" : false,
        "_shards" : {
            "total" : 5,
            "successful" : 5,
            "skipped" : 0,
            "failed" : 0
        },
        "hits" : {
            "total" : timeSerie.items.length,
            "max_score" : 1.0,
            "hits" : [
            ]
        }
    };

    timeSerie.items.forEach(function(tsItem, index, array) {
        var hit = {
            "_index" : esIndex,
            "_type" : "data",
            "_id" : makeid(),
            "_score" : 1.0,
            "_source" : {
                "timestamp" : tsItem.timestamp,
                "val" : tsItem.val
            }
        };
        esRes.hits.hits.push(hit);


    });

    return esRes;

}

/******************************************************************************
                            fixtures
*****************************************************************************/




exports.values = []
    ;
