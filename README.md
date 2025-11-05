Presently, this repository is for evaluating javascript table handling libraries in preparation for writing an MPP about supporting a projet that is to display tabular data with ~ 13k rows.

Generating the data.json file:

```ruby
require 'json'
rows = []
File.open("apc.tsv").each_line { |line| fields = line.chomp.split("\t") ; rows << fields[0..3] + fields[6..8] }
rows.shift
rows.compact!
rows.reject! { |row| row.empty? || row.all?(&:empty?) }
File.write("data.json", {data: rows.map { |row| row.map { |field| field.empty? ? nil : field }}}.to_json)
```
