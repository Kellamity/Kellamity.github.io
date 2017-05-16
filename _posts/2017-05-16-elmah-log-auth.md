---
layout: post
title:  "Configure Elmah web error log for authorised access only"
date:   2017-05-16
---

This looks like a big fat no-go.  Elmah hooks into the ASP.NET Authentication, which would be wonderful, if I had any!

This is part of my ongoing Elmah improvements listed [here]({{ site.baseurl }}{% post_url 2017-05-15-working-with-elmah %})

## How can Azure open a browser?

I didn’t want to set the access to elmah.axd to remote only, because I have no idea how you can be ‘local’ on an Azure hosted web application.  It seems to be not impossible but too complicated for the sole purpose of looking at the log, when I can store the files anyway.  The main issue is speed of access.  If I get a message saying the site is not working, going to the URL would be the fastest way for me to see the errors and gage what is going on.  

## There’s no authentication on this site…

For now though I guess the ‘login to the error screen’ thing will have to be put on hold, because I don’t have time to implement authentication just for this one screen.  There’s also no database, which makes authentication even trickier.  Either we accept the risks of anyone being able to type /elmah and have a look, or no one can see it.

I will report this back to the developer who does the Azure deployments, and he can decide.

<div class="PageNavigation">
  {% if page.previous.url %}
    <a class="prev" href="{{page.previous.url}}">&laquo; {{page.previous.title}}</a>
  {% endif %}
  {% if page.next.url %}
    <a class="next" href="{{page.next.url}}">{{page.next.title}} &raquo;</a>
  {% endif %}
</div>
