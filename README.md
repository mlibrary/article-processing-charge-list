Presently, this repository is for evaluating javascript table handling libraries in preparation for writing an MPP about supporting a projet that is to display tabular data with ~ 13k rows.

Generating the data.json file:

```ruby
require 'json'
docs = []
File.open(Dir.glob("*.tsv").first).each_line do |line|
   row = line.chomp.split("\t")
   next if row.empty?
   docs << [row[0], row[1], row[2], row[3], row[6], row[7], row[8], row[6].include?("Ann Arbor") , row[6].include?("Flint"), row[6].include?("Dearborn")]
end
docs.shift
File.write("html/data.json", {data: docs}.to_json)
```
