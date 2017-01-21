var request = require('request'),
    cheerio = require('cheerio');

var sqlite3 = require('sqlite3').verbose();
var database = "storage.db"
console.log('[+] Creating database: ' + database);
var db = new sqlite3.Database(database);

var pw_url = "https://primewire.unblocked.ink"

console.log('[+] Creating table with rows...');
db.serialize(function() {
  db.run("CREATE TABLE IF NOT EXISTS main (title TEXT, film_page_links TEXT, img_url TEXT)");
});

function iter_pages(page_number) {
  console.log('[+] Attempting to fetch HTML...');
  request(pw_url + '/index.php?sort=featured&page=' + page_number, function(err, resp, body) {
    if(!err && resp.statusCode == 200) {
      console.log('[+] The request response status code is: ' + resp.statusCode);
      var $ = cheerio.load(body);
      console.log('[+] Inserting values into database.');
      $('.index_item a', '.index_container').each(function() {
        var url = $(this).attr('href');
        var title = $(this).attr('title');
        if(url.startsWith('/watch-')) {
          //urls.push('https://primewire.unblocked.ink' + url);
          db.run("INSERT INTO main (title, film_page_links) VALUES (?, ?)",
                  title.replace("Watch ", ""),
                  pw_url + url);
        };
      });
      $('.index_item img', '.index_container').each(function() {
        var img_url = $(this).attr('src');
        db.run("INSERT INTO main (img_url) VALUES (?)", img_url);
      });
      console.log('[+] Processed page:' + page_number);
    }
  });
}

//for (var i = 1; i < 2920; i++) {
for (var i = 1; i < 100; i++) {
    iter_pages(i);
}
