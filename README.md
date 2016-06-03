# Installation
The scraper requires CasperJS. It's tested to work with CasperJS 1.1.1 and PhantomJS 2.1.1.

# Usage
    $ casperjs concordia.js --semester="Fall 2016" --course=COMP [--code=218 [--number=1796]]

`--semester` is the semester the course takes place in. Seems to follow the format of "_season_ _year_"

`--course` is the course subject

`--code` is the course number. It's optional, if you omit it you'll get back all courses that are part of the subject

`--number` is the class number that uniquely identifies a section. Also optional

# Output

```json
{
	"courses": [
		{
			"name": "COMP  218 - Fundamentals of Programming",
			"sections": [
				{
					"class": "1796",
					"instructor": "Nancy Acemian",
					"section": "EC-LEC  13 Wk",
					"status": "open",
					"term": "Fall 2016",
					"time": "TBA"
				},
				{
					"class": "7381",
					"instructor": "Nancy Acemian",
					"section": "ECEA-TUT  13 Wk",
					"status": "open",
					"term": "Fall 2016",
					"time": "Tu 5:45PM - 7:25PM"
				},
				{
					"class": "7382",
					"instructor": "Nancy Acemian",
					"section": "ECEB-TUT  13 Wk",
					"status": "open",
					"term": "Fall 2016",
					"time": "Th 10:15AM - 11:55AM"
				}
			]
		}
	],
	"status": "success"
}
```

If there's an error, the `status` attribute will reflect that.
```json
{
	"status": "error",
	"message": "Failed to load class list"
}
```

# License
The MIT License (MIT)

Copyright (c) 2016 Noah Lackstein