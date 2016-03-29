function validateSentence(sentence) {

  var checkKeywordArray = [
    'Elasticsearch',
    'ElastiCache',
    'Solr',
    'DynamoDB',
    'Amazon',
    'Gateway',
    'Analyzer',
    'Analyzers',
    'Analyze',
    'Analysis',
    'Query',
    'Indices',
    'Document',
    'Documents',
    'Cluster',
    'Shards',
    'Shard',
    'Template'
  ]

  var levenshteinDistance = function(a, b) {
    var matrix = new Array(a.length + 1);
    for (var i = 0; i < a.length + 1; i++) {
      matrix[i] = new Array(b.length + 1);
    }

    for (var i = 0; i < a.length + 1; i++) {
      matrix[i][0] = i;
    }

    for (var j = 0; j < b.length + 1; j++) {
      matrix[0][j] = j;
    }

    for (var i = 1; i < a.length + 1; i++) {
      for (var j = 1; j < b.length + 1; j++) {
        var x = a[i - 1] == b[j -1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j- 1] + x
        );
      }
    }

    return matrix[a.length][b.length];
  }

  console = {
      log: print,
      warn: print,
      error: print
  };

  for (var i = 0; i < sentence.tokens.length; i++) {
    // 名詞だけを対象に
    if (sentence.tokens[i].tags[0] == '名詞' && sentence.tokens[i].surface.length > 3) {
      if (checkKeywordArray.indexOf(sentence.tokens[i].surface) == -1) {
        for (var j=0; j < checkKeywordArray.length; j++) {
          //console.log('checking : ' + sentence.tokens[i].surface + ' and ' + checkKeywordArray[j])
          var dist = levenshteinDistance(sentence.tokens[i].surface, checkKeywordArray[j])
          //console.log(sentence.tokens[i].surface +' is ' + dist)
          if (dist <= 2 && dist != 0){
            addError(sentence.tokens[i].surface + ' はスペルミスの可能性があります', sentence);
          }
        }
      }
    }
  }
}
