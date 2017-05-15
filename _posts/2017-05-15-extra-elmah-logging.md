---
layout: post
title:  "Extra Elmah logging"
date:   2017-05-15
---

I need to have Elmah log potentially dangerous Request.Form values caught by HttpRequestValidationException.

This is part of my ongoing Elmah improvements listed [here]({{ site.baseurl }}{% post_url 2017-05-15-working-with-elmah %})

This is a known Elmah issue, and there seems to be no official solution included in the nugget package.  There are various workarounds, a lot of which involve editing the Elmah source code.  I found one that works for MVC applications that was actually quite simple, once I worked out what I actually needed to do!

The reason it was important to log these error is that the testers flagged ‘Combination of symbols like “</” is crashing any page’.  My first response to this is, ‘good!’  Out of the box security features are working as intended, job done!  The testers countered that maybe a user will enter something like that legitimately and because it’s not handled with validation or I dunno what, they will be dumped to the error screen and that’s not good.  In my opinion, people who enter stuff like that know exactly what they are doing, and should expect it to fail.  The chances of someone entering a combination of dangerous characters when legitimately filling out the form is slim to none.  Not worth turning this feature off, then validating/filtering every input manually instead.  Do I just not want to write some regex?  Haha, maybe… but seriously this feature is there for a reason, and I am very very reluctant to disable it without good reason.  That’s where the error catching comes on.  If people start calling up saying they were half way through the form and it crashed, I can what people have been entering in, and find out if it’s legitimate people including HTML tags because they think they can format their text (why would they?) or if it’s all attempted JavaScript, SQL attacks.  My plan is to never fix this ‘defect’.

So I need Elmah to log this sort of stuff.

What looked like the easiest way to do this was to create a new exception filter, register it with the global filters, and use it to manually throw an exception of this type to Elmah. 

I found a blog post from way back detailing how to do this [here](http://www.howtosolutions.net/2012/10/elmah-not-logging-httprequestvalidationexception-problem/)

And it didn’t work… After puzzling over it for a while I realised what I was doing wrong.  The example shows the RegisterGlobalFilters as part of the Global.asax.cs file.  It’s actually in the FilterConfig.cs file.  I think this post from 2012 shows the way Visual Studio USED to set up an MVC project.  I’ve actually been caught out by this before when trying to add to the RegisterRoutes method.  I should have realised what was going on sooner, but I guess I was tired yesterday… This morning when trying to work out why my new exception filter was not being hit, I saw that there already was a RegisterGlobalFilters method being called above where I was trying to do mine.

My Global.asax.cs looks like this
{% highlight csharp  %}
        
    protected void Application_Start()
    {
        //Disable response header
        MvcHandler.DisableMvcResponseHeader = true;

        AreaRegistration.RegisterAllAreas();
        FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
        RouteConfig.RegisterRoutes(RouteTable.Routes);
        BundleConfig.RegisterBundles(BundleTable.Bundles);
    }
{% endhighlight %}

I added this code to the FilterConfig.cs

{% highlight csharp  %}
        
    public static void RegisterGlobalFilters(GlobalFilterCollection filters)
    {
        filters.Add(new ElmahRequestValidationErrorFilter());
        filters.Add(new HandleErrorAttribute());
    }
{% endhighlight %}

And this is the new exception filter
{% highlight csharp  %}
        
    using System.Web;
    using System.Web.Mvc;

    namespace DBDRVWebsite.Web.Filters
    {
        public class ElmahRequestValidationErrorFilter : IExceptionFilter
        {
            public void OnException(ExceptionContext filterContext)
            {
                if (filterContext.Exception is HttpRequestValidationException)
                {
                    Elmah.ErrorLog.GetDefault(HttpContext.Current).Log(new Elmah.Error(filterContext.Exception));
                }
            }
        }
    }
{% endhighlight %}

I stored it as a class in a new Filters folder.  In the future there may be more custom filters, and this is how the demo project is structured in the [ASP.NET MVC 4 Custom Action Filters](https://docs.microsoft.com/en-us/aspnet/mvc/overview/older-versions/hands-on-labs/aspnet-mvc-4-custom-action-filters) tutorial, so it seemed like a good way to go.

Throwing a bit of dodgy code into one of my text boxes sent me to the custom error screen, and the following appeared in the Elmah log:

<table>
  <tbody>
    <tr>
      <td style="text-align: left">500</td>
      <td style="text-align: left"><strong>HttpRequestValidation</strong></td>
      <td style="text-align: left">A potentially dangerous Request.Form value was detected from the client (Comments="<code>").</td>
    </tr>
  </tbody>
</table>

Success!!!

These errors are now being logged, but not getting emailed.  That's a problem for the next post, however...
