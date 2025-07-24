Presently, this repository is for evaluating javascript table handling libraries in preparation for writing an MPP about supporting a projet that is to display tabular data with ~ 13k rows.

Generating the data.json file:

```ruby
require 'json'
docs = []
File.open("apc.tsv").each_line { |line| docs << line.chomp.split("\t") }
docs.shift
File.write("data.json", {data: docs}.to_json)
```
