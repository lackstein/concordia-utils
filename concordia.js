var casper = require('casper').create();
var url = 'https://campus.concordia.ca/psc/pscsprd/EMPLOYEE/HRMS/c/CU_EXT.CU_CLASS_SEARCH.GBL';

// Check for required arguments
if(typeof casper.cli.options['semester'] !== 'string' && typeof casper.cli.options['semester'] !== 'number') {
  casper.die(error('--semester must be either a string or a number'));
}

if(casper.cli.options['subject'] === undefined) {
  casper.die(error('--subject is a required argument'));
}

casper.start(url);

// Fill out the course search form
casper.thenEvaluate(function(semester, subject_code, course_code, course_number) {
    var terms = document.getElementById('CLASS_SRCH_WRK2_STRM$35$');
    // semester can be either a string that will be matched
    // against the option's text or the value of the option
    if(typeof semester === "string") {
      // The option text is left-padded with spaces, so we'll match against the right-hand side
      semester = new RegExp('\\s+' + semester + '$');
      for (var i = 0; i < terms.options.length; ++i) {
        if (terms.options[i].text.match(semester)) {
          terms.options[i].selected = true;
          break;
        }
      }
    } else if(typeof semester === "number") {
      terms.value = semester;
    }
    addchg_win0(terms);
  
    var career = document.getElementById('SSR_CLSRCH_WRK_ACAD_CAREER$0');
    career.value = 'UGRD';
    addchg_win0(career);
    
    
    var subject = document.getElementById('SSR_CLSRCH_WRK_SUBJECT$1');
    subject.value = subject_code;
    addchg_win0(subject);
    
    if(typeof course_code === 'number') {
      var number = document.getElementById('SSR_CLSRCH_WRK_CATALOG_NBR$2');
      number.value = course_code;
      addchg_win0(number);
    }
  
    if(typeof course_number === 'number') {
      var class_number = document.getElementById('SSR_CLSRCH_WRK_CLASS_NBR$10');
      class_number.value = course_number;
      addchg_win0(class_number);
    }
    
    // Submit the form
    submitAction_win0(document.win0,'CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH');
}, casper.cli.options["semester"], casper.cli.options["course"],
  casper.cli.options["code"], casper.cli.options["number"]);

// Parse the search results
casper.waitFor(function check() {
  // If there are more than 100 results, we need to say we're okay with that
  if(this.exists('input[id="#ICSave"]')) {
    this.evaluate(function() { submitAction_win0(document.win0, '#ICSave'); });
  }
  
  // Results are loaded when the 'Search Results' text exists
  if(this.getPageContent().indexOf('Search Results') !== -1) {
    return true;
  }
}, function then() {
  var courses = this.evaluate(function() {
    var result = { 'courses': [] };
    var all_courses = document.querySelectorAll('table[id="ACE_$ICField$4$$0"] > tbody > tr > td:nth-child(2) > div');
    
    // Loop through all the courses on the results page
    for(var i = 0; i < all_courses.length; i++) {
      var course = all_courses[i];
      var course_info = { 'sections': [] };
      
      // Remove toggle link so that we're left with just the course name
      course.querySelector('.PSLEFTCORNER').children[0].remove();
      course_info['name'] = course.querySelector('.PSLEFTCORNER').innerHTML.replace(/&nbsp;/g, ' ').trim();
      
      // Get the details for each section
      var course_sections = course.querySelectorAll('tr[id^="trSSR_CLSRCH_MTG1$"]');
      for(var j = 0; j < course_sections.length; j++) {
        var section = course_sections[j];

        course_info['sections'].push({
          'class': section.querySelector('a[name^="MTG_CLASS_NBR$"]').innerHTML,
          'section': section.querySelector('a[name^="MTG_CLASSNAME$"]').innerHTML.replace(/<br>|\n/g, ' '),
          'time': section.querySelector('span[id^="MTG_DAYTIME$"]').innerHTML,
          'instructor': section.querySelector('span[id^="MTG_INSTR$"]').innerHTML.replace(/<br>|\n/g, ' '),
          'term': section.querySelector('span[id^="SSR_CSTRMADM_VW_DESCR$"]').innerHTML,
          'status': section.querySelector('.SSSIMAGECENTER').src
                    .match(/STATUS_(OPEN|WAITLIST|CLOSED)_ICN/)[1].toLowerCase()
        });
      }
      
      result['courses'].push(course_info);
    }
    
    return result;
  });
  courses['status'] = 'success';
  this.echo(JSON.stringify(courses, null, '\t'));
}, function timeout() {
  var error_message = this.getHTML('span#DERIVED_CLSMSG_ERROR_TEXT');
  
  this.echo(error(error_message || 'Failed to load class list'));
}, 5000);

// Click the link to get details about a section
// casper.thenEvaluate(function() {
//   submitAction_win0(document.win0,'MTG_CLASSNAME$0');
// });
//
// Course details page is loaded
// casper.waitForText('Class Detail', function() {
//   // this.echo(this.getHTML());
// }, function() {
//   // We timed out
//   this.echo('failed to select course');
// }, 2000);
//
// Render the page that's loaded -- good for debugging
// casper.then(function() {
//   this.capture('test.png');
// });

casper.run();

function error(message) {
  return JSON.stringify({
    'status': 'error',
    'message': message
  }, null, '\t');
}