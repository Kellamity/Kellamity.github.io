---
layout: post
title:  "Have Elmah send via email"
date:   2017-05-17
---

In addition to logging the errors in a folder, I would like Elmah to send out an email.

This is part of my ongoing Elmah improvements listed [here]({{ site.baseurl }}{% post_url 2017-05-15-working-with-elmah %})

## Outgoing SMTP issues

I don’t even want to go into details here, because it was a crappy morning of trying to figure this out, but basically, IIS no longer supports a virtual SMTP server to develop on.

And it gets worse.  My site is hosted on Azure, and there is no support for an SMTP server there either, you need a third party provider!

So I have all the code to get Elmah to send an email of it's error logs, but no outgoing SMTP server to send it through!  The official M$ pages recommended I pay for something called SendGrid or using exchange as a smart host.  The second one is probably the best option if we were going to be sending a lot of emails, but that seems a bit hard core for what I want to do.  We send email out through CRM somehow, but I have no idea how that's configured.

It occurs to me that we already pay for email in some format as we have Office 365 and Outlook through that.  I had a go at using those outgoing SMTP settings to send from the application, and it worked!  Only thing was you can’t send anonymous, you need to authenticate your account with a username and password.  I was using my own account for testing, but obviously I don’t want to deploy to prod with my Office 365 password stored in the web config.  I explained the outgoing email issue to the senior developer and suggested that we create an account for the sole purpose of being the application error bot.  He didn’t see a problem with doing it that way (I’m not 100% sure this is what Microsoft had in mind when they said to use a 3rd party supplier…) but we created an account, put the details in, and the emails are sending.  We also created a group to receive the emails which we can add / remove members of the development team to as needed.

Currently this is in local and yet to be tested on the Azure hosted instances.

## Configuring Elmah to send email

Only a few steps were required to set up Elmah and the outgoing SMTP stuff.

In order for Elmah to be able to log via email the ErrorMail module needs to be referenced in three places in the web.config.  These references were added automatically when the Elmah package was installed but in my case one of them was removed when someone did a commit they titled ‘Elmah configuration refactor’ (??) so I’m listing them all here for reference.

{% highlight xml  %}
<configSections>
    <sectionGroup name="elmah">
        <section name="security" requirePermission="false" type="Elmah.SecuritySectionHandler, Elmah" />
        <section name="errorLog" requirePermission="false" type="Elmah.ErrorLogSectionHandler, Elmah" />
        <section name="errorMail" requirePermission="false" type="Elmah.ErrorMailSectionHandler, Elmah" />
        <section name="errorFilter" requirePermission="false" type="Elmah.ErrorFilterSectionHandler, Elmah" />
    </sectionGroup>
</configSections>
<system.web>
    <httpModules>
      <add name="ErrorLog" type="Elmah.ErrorLogModule, Elmah" />
      <add name="ErrorMail" type="Elmah.ErrorMailModule, Elmah" />
      <add name="ErrorFilter" type="Elmah.ErrorFilterModule, Elmah" />
    </httpModules>
</system.web>
<system.webServer>
    <modules>
      <add name="ErrorLog" type="Elmah.ErrorLogModule, Elmah" preCondition="managedHandler" />
      <add name="ErrorMail" type="Elmah.ErrorMailModule, Elmah" preCondition="managedHandler" />
      <add name="ErrorFilter" type="Elmah.ErrorFilterModule, Elmah" preCondition="managedHandler" />
    </modules>
</system.webServer>
{% endhighlight %} 

Now it can work, it needs to be configured.  Elmah can use the SMPT settings in the web.config, so that’s how I am doing it.  Anywhere inside the configuration element you add:

{% highlight xml  %}
<system.net>
    <mailSettings>
        <smtp>
            <network host="outgoing.smtp.com" userName="sender@email.com" password="Password123" enableSsl="true" port="587" />
        </smtp>
    </mailSettings>
</system.net>
{% endhighlight %}

In my case I had to enable SSL because the outgoing SMTP settings asked for encryption method STARTTLS.  In case I ever need to find those again, in Outlook 365 you go to Settings, Your app settings, Mail, Accounts, POP and IMAP settings, and the SMTP setting is listed there.

Then you just need to tell Elmah that you wish to use those settings.  In the Elmah element (which was not created by default when the package was installed) you need to add an errorMail setting:

{% highlight xml  %}
<elmah>
    <errorMail from="sender@email.com" to="group@email.com" async="true" smtpServer="outgoing.smtp.com" useSsl="true" />
</elmah>
{% endhighlight %}

## Customising the email

This is all you need to have the emails send, but it’s also possible to customise them a little.  By default they have a subject of ‘Error (exception): Exception message’.  This is ok but as I will have emails going to the same place from each environment I would like to know if the error is coming from dev, test, uat or prod without having to read the details.

There’s a way to hook into the ErrorMailModule’s Mailing method.  You can do a lot here like add extra recipients in the CC field, edit the body etc. but I am just interested in editing the subject for now.  Instead of the default I want to know the environment, and the type of exception.  This should make it a bit easier to sort the mailbox, and quickly gage what is going on.  I added this method to the Global.asax file:

{% highlight csharp  %}
void ErrorMail_Mailing(object sender, Elmah.ErrorMailEventArgs e)
{
    var deploymentName = System.Configuration.ConfigurationManager.AppSettings["deploymentName"];
    var errorType = e.Error.Type;
    e.Mail.Subject = deploymentName + ": " + errorType;
}
{% endhighlight %}

and put a new key in the web.config for deploymentName and in each of my build configuration transforms.

{% highlight xml  %}
  <appSettings>
    <add key="deploymentName" value="local" />
  </appSettings>
{% endhighlight %}

Now I get an email with a subject that reads ‘Deployment name: Exception type’.

In testing some of the emails are delayed in arriving, but I think I can safely blame Lotus Notes for that.
