Presently, this repository is for evaluating javascript table handling libraries in preparation for writing an MPP about supporting a projet that is to display tabular data with ~ 13k rows.

Generating the data.json file:

```ruby
require "json"

VERSION = "2025-11-07.1"
HEADER = ["Publisher", "Journal Title", "eISSN", "eISSN Link", "Discount or Waiver", "Campuses Covered", "Coverage Years", "Link to Agreement Info"]

rows = []
File.open("apc.tsv").each_line { |line| fields = line.chomp.split("\t") ; rows << fields }
header = rows.shift
if HEADER.join("") == header.join("")
  rows.compact!
  rows.reject! { |row| row.empty? || row.all?(&:empty?) }
  File.write("html/data.json", {
    header: HEADER,
    version: VERSION,
    data: rows.map { |row| row.map { |field| field.empty? ? nil : field }}}.to_json)
end
```
