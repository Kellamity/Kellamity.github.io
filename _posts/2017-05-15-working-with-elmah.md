---
layout: post
title:  "Working with Elmah"
date:   2017-05-15
---

I'm using Elmah for error logging in an MVC application.

To start with, the senior developer said to me, “You should include Elmah into the project for logging.”  I found the nugget package, ran the site and had a look at /elmah, and that was that.  There wasn’t really much time to explore how it worked in detail, and just having it there seemed like a good starting point.

Now the production site is actually deployed, it occurs to me that anyone can just chuck the /elmah path onto the URL and have a look at the log.  Not ideal!  It also seems that once the web server refreshes, or something, the log empties out.  Not at all useful for tracking issues.  There are also some exceptions that I would like to log, but Elmah doesn’t catch.

I’ve been working through the steps to improve this situation, and it’s getting quite complex, so I want to keep track of what I am going, for when I have to do it again in the future!

Tasks:
<ul>
<li><a href="https://kellamity.github.io/2017/05/15/extra-elmah-logging.html">Have Elmah log potentially dangerous Request.Form values caught by HttpRequestValidationException</a></li>
<li><a href="https://kellamity.github.io/2017/05/16/elmah-log-auth.html">Configure Elmah web error log for authorised access only</a></li>
<li><a href="https://kellamity.github.io/2017/05/16/elmah-log-files.html">Have Elmah log error files to folder</a></li>
<li>Have Elmah send errors out via email</li>
<li>Find a way to monitor above folder and archive/delete files over a certain age</li>
</ul>

Work in progress...
