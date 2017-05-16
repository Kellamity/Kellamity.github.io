---
layout: post
title:  "Have Elmah log error files to folder"
date:   2017-05-16
---

I want the Elmah error files to go somewhere, because each time the server is restarted (is that when it happens?) they all dissapear from the web UI.

This is part of my ongoing Elmah improvements listed [here]({{ site.baseurl }}{% post_url 2017-05-15-working-with-elmah %})

## Where to log?

I figured the App_Data folder was a good place to store this sort of thing.  There’s a couple of concerns though.
<ul>
<li>Is it included in the build?</li>
<li>Will it get wiped with each new build?</li>
</ul>

The publish profile already has a 

{% highlight xml  %}
<ExcludeApp_Data>False</ExcludeApp_Data>
{% endhighlight %} 

so I figure that’s a good start.

As for the next potential problem, I’m not sure.  Currently, there is no App_Data folder in the deployed site’s file structure.  I am fairly sure that’s because if the folder is empty, it won’t create it.  I could create it manually but I don’t know about poking around in Azure clicking on folders (especially if I will have to do it for prod) so I created an empty text file in my new /Elmah logging folder, so in theory, that will cause the App_Data/Elmah folders to be created next time we publish.  What I don’t want to see happen, is each time we publish the logs get deleted, and the foo.txt file being the only thing in there.

Possibly once the folder is created I can change the ‘Delete additional files’ setting (there shouldn’t be much crap hanging around) or create a skip rule.  Potentially I can hand this problem off to the ‘deployment guy’ but I’d like to have some idea of what’s going on first.  The whole point of storing the logs somewhere is because each time there is a build the browser based log is reset!  I will have a play with it tomorrow and see what happens.

## Get the logging working

Here are the steps taken:

Web.Config needs a few Elmah error log entries in system.Webserver.  The one in modules was already there, I added the one in the elmah section.  I created a folder called Elmah in my App_Data directory, and set it as the logPath.

{% highlight xml  %}
<modules>
    <remove name="ScriptModule" />
    <add name="ScriptModule" preCondition="managedHandler" type="System.Web.Handlers.ScriptModule, System.Web.Extensions, Version=3.5.0.0, Culture=neutral, PublicKeyToken=31BF3856AD364E35" />
    <add name="ErrorLog" type="Elmah.ErrorLogModule, Elmah" />
</modules>

<elmah>
<security allowRemoteAccess="true" />
    <errorLog type="Elmah.XmlFileErrorLog, Elmah" logPath="~/App_Data/Elmah" />
</elmah>
{% endhighlight %} 

That's it!  I ran the site and threw a 404 error to test, and an XML file ended up in the folder!  It's the same as the full details you see in the web UI when you click on Raw/Source data in XML (IE, ugly).

{% highlight xml  %}
<error errorId="c56d88eb-e87d-4597-8173-e9bf5670751d" application="/LM/W3SVC/2/ROOT" host="MY_PC" type="System.Web.HttpException" 
message="The controller for path '/errorlogme' was not found or does not implement IController." source="System.Web.Mvc" 
detail="System.Web.HttpException (0x80004005): ERROR_MESSAGE_TEXT" time="2017-05-16T00:11:28.1013363Z" statusCode="404">
  <serverVariables>
  </serverVariables>
  <cookies>
  </cookies>
</error>
{% endhighlight %} 

## How to view the files?

I guess when you have admin access in Azure you go log in, open App Service Editor, and look inside the folder?  I’ll work on getting them in there first, then we can revisit how to make good use of them later.

## Keeping the folder clean

Opposite to my ‘will I lose the files when I publish’ problem, I don’t want to end up in a situation where they build up forever, and eventually the space runs out.  I have seen this before!  It took about 10 months of some kind of extreme logger that someone forgot to turn off before the server filled up and mysteriously stopped working.  No one seemed to know who had activated the logging, or why…  

But anyway.  I think it would be a good idea to have a way to automatically monitor this folder, and empty it, or copy the files somewhere else, from time to time.  I think possibly an Azure Webjob could do this work.  I know absolutely nothing about this, but it could be a good chance to learn.
